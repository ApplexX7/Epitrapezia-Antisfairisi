import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { db, ensureTicTacToeStatsForPlayer } from "../databases/db";
import { UserSocket } from "./gameSocket";

interface TicTacToeRoom {
  id: string;
  players: UserSocket[];
  board: (string | null)[];
  currentTurn: number; // index of player whose turn it is
  scores: { [userId: number]: number };
  playerSymbols: { [userId: number]: "X" | "O" };
  recorded?: boolean;
  recording?: boolean; // lock to avoid double db writes
  roundWinner?: number | null;
  gameOver?: boolean;
}

let tictactoeMatchmakingQueue: UserSocket[] = [];
const activeTicTacToeRooms: Record<string, TicTacToeRoom> = {};

function leaveAllTicTacToeRooms(player: UserSocket, keepRoomId?: string) {
  // removes socket from all tictactoe rooms except the current one
  try {
    for (const r of player.rooms) {
      if (r === player.id) continue;
      if (keepRoomId && r === keepRoomId) continue;
      if (typeof r === "string" && r.startsWith("ttt-room-")) {
        try {
          player.leave(r);
        } catch {}
      }
    }
  } catch {}
}

async function getAvatar(userId: number): Promise<string> {
  // gets player avatar or uses a default image
  return new Promise((resolve) => {
    db.get(
      "SELECT avatar FROM players WHERE id = ?",
      [userId],
      (err: any, row: any) => {
        if (err) {
          console.error("Error fetching avatar for user", userId, err?.message || err);
          return resolve("/images/player2.png");
        }
        resolve(row?.avatar ? row.avatar : "/images/player2.png");
      }
    );
  });
}

function updateLevel(playerId: number) {
  // level depends only on total experience
  db.get(
    `SELECT experience FROM players WHERE id = ?`,
    [playerId],
    (err, row: { experience: number }) => {
      if (err) {
        console.error("Error getting experience:", err);
        return;
      }

      const newLevel = Math.floor(row.experience / 100) + 1;

      db.run(
        `UPDATE players SET level = ? WHERE id = ?`,
        [newLevel, playerId],
        (updateErr) => {
          if (updateErr) console.error("Error updating level:", updateErr);
        }
      );
    }
  );
}

function checkWinner(board: (string | null)[]): { player: string; line: number[] } | null {
  // checks all winning lines on the board
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return { player: board[a]!, line };
    }
  }
  return null;
}

function isBoardFull(board: (string | null)[]): boolean {
  // true when no empty cell remains
  return board.every((cell) => cell !== null);
}

async function recordTicTacToeMatchResult(
  room: TicTacToeRoom,
  winnerId: number,
  loserId: number
): Promise<boolean> {
  // stops multiple writes from disconnects or retries
  if (room.recorded || room.recording) return false;
  room.recording = true;

  try {
    // basic safety check
    if (!winnerId || !loserId || winnerId === loserId) {
      console.error("Invalid player IDs for tictactoe result", { winnerId, loserId });
      return false;
    }

    await ensureTicTacToeStatsForPlayer(winnerId);
    await ensureTicTacToeStatsForPlayer(loserId);

    // update win and loss counters
    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE tictactoe_stats SET total_games = total_games + 1, wins = wins + 1 WHERE player_id = ?`,
        [winnerId],
        (err) => (err ? reject(err) : resolve())
      );
    });

    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE tictactoe_stats SET total_games = total_games + 1, losses = losses + 1 WHERE player_id = ?`,
        [loserId],
        (err) => (err ? reject(err) : resolve())
      );
    });

    // give xp for playing and winning
    db.run(`UPDATE players SET experience = experience + 5 WHERE id = ?`, [loserId]);
    db.run(`UPDATE players SET experience = experience + 15 WHERE id = ?`, [winnerId]);

    updateLevel(winnerId);
    updateLevel(loserId);

    // save match history if both players exist
    const p1Id = room.players[0]?.user?.id;
    const p2Id = room.players[1]?.user?.id;

    if (p1Id && p2Id) {
      const p1Score = room.scores[p1Id] ?? 0;
      const p2Score = room.scores[p2Id] ?? 0;

      let resolvedWinner = winnerId;
      if (p1Score > p2Score) resolvedWinner = p1Id;
      else if (p2Score > p1Score) resolvedWinner = p2Id;

      await new Promise<void>((resolve, reject) => {
        db.run(
          `INSERT INTO tictactoe_history (player1_id, player2_id, player1_score, player2_score, winner_id)
           VALUES (?, ?, ?, ?, ?)`,
          [p1Id, p2Id, p1Score, p2Score, resolvedWinner],
          (err) => (err ? reject(err) : resolve())
        );
      });
    }

    room.recorded = true;
    return true;
  } catch (e) {
    console.error("Failed to record tictactoe match result", room.id, e);
    return false;
  } finally {
    room.recording = false;
  }
}

export async function createTicTacToeRoom(
  io: Server,
  playerX: UserSocket,
  playerO: UserSocket
): Promise<{ roomId: string } | null> {
  // avoid invalid or self matches
  if (!playerX?.user?.id || !playerO?.user?.id) return null;
  if (playerX.user.id === playerO.user.id) return null;

  const roomId = `ttt-room-${uuidv4()}`;
  const room: TicTacToeRoom = {
    id: roomId,
    players: [playerX, playerO],
    board: Array(9).fill(null),
    currentTurn: 0,
    scores: {
      [playerX.user.id]: 0,
      [playerO.user.id]: 0,
    },
    playerSymbols: {
      [playerX.user.id]: "X",
      [playerO.user.id]: "O",
    },
    recorded: false,
    roundWinner: null,
    gameOver: false,
  };

  activeTicTacToeRooms[roomId] = room;

  // remove both players from queue
  tictactoeMatchmakingQueue = tictactoeMatchmakingQueue.filter(
    (s) => s.id !== playerX.id && s.id !== playerO.id
  );

  // make sure each socket is only in this room
  leaveAllTicTacToeRooms(playerX, roomId);
  leaveAllTicTacToeRooms(playerO, roomId);

  playerX.join(roomId);
  playerO.join(roomId);

  const [xAvatar, oAvatar] = await Promise.all([
    getAvatar(playerX.user.id),
    getAvatar(playerO.user.id),
  ]);

  // send match info to both players
  playerX.emit("ttt:matched", {
    opponent: {
      id: playerO.user.id,
      username: playerO.user.username,
      avatar: oAvatar,
    },
    symbol: "X",
    roomId,
  });

  playerO.emit("ttt:matched", {
    opponent: {
      id: playerX.user.id,
      username: playerX.user.username,
      avatar: xAvatar,
    },
    symbol: "O",
    roomId,
  });

  // send starting board
  io.to(roomId).emit("ttt:gameState", {
    board: room.board,
    currentTurn: playerX.user.id,
    scores: room.scores,
    playerSymbols: room.playerSymbols,
    winner: null,
    isDraw: false,
  });

  return { roomId };
}

export function registerTicTacToeSocket(io: Server, socket: UserSocket) {
  socket.on("ttt:joinMatchup", async () => {
    // stops same socket from joining twice
    if (tictactoeMatchmakingQueue.some((s) => s.id === socket.id)) {
      socket.emit("ttt:stopMatchmaking");
      return;
    }

    tictactoeMatchmakingQueue.push(socket);
    socket.emit("ttt:waiting");

    const opponent = tictactoeMatchmakingQueue.find((s) => s.user.id !== socket.user.id);
    if (!opponent) return;

    await createTicTacToeRoom(io, socket, opponent);
  });

  socket.on("ttt:makeMove", async ({ roomId, index }) => {
    const room = activeTicTacToeRooms[roomId];
    if (!room) return;

    // makes sure the sender belongs to this room
    const playerIndex = room.players.findIndex((p) => p.id === socket.id);
    if (playerIndex === -1) return;

    // blocks moves after game end or while saving
    if (room.gameOver || room.recorded || room.recording) return;

    // blocks moves after a round is decided
    if (room.roundWinner !== null) return;

    // checks turn order
    if (room.currentTurn !== playerIndex) return;

    // checks valid cell
    if (index < 0 || index > 8 || room.board[index] !== null) return;

    room.board[index] = room.playerSymbols[socket.user.id];

    const winResult = checkWinner(room.board);
    const isDraw = !winResult && isBoardFull(room.board);

    if (winResult) {
      room.scores[socket.user.id] = (room.scores[socket.user.id] ?? 0) + 1;
      room.roundWinner = socket.user.id;

      // first to three wins the match
      if (room.scores[socket.user.id] >= 3) {
        room.gameOver = true;

        const loser = room.players.find(p => p.id !== socket.id);
        if (loser) await recordTicTacToeMatchResult(room, socket.user.id, loser.user.id);

        io.to(roomId).emit("ttt:gameState", {
          board: room.board,
          currentTurn: null,
          scores: room.scores,
          playerSymbols: room.playerSymbols,
          winner: { oderId: socket.user.id, line: winResult.line, username: socket.user.username },
          isDraw: false,
          matchOver: true,
        });

        delete activeTicTacToeRooms[roomId];
        return;
      }
    }

    if (!winResult) room.currentTurn = room.currentTurn === 0 ? 1 : 0;
    const nextPlayer = room.players[room.currentTurn];

    io.to(roomId).emit("ttt:gameState", {
      board: room.board,
      currentTurn: winResult ? null : nextPlayer?.user.id,
      scores: room.scores,
      playerSymbols: room.playerSymbols,
      winner: winResult
        ? { oderId: socket.user.id, line: winResult.line, username: socket.user.username }
        : null,
      isDraw,
      matchOver: false,
    });
  });
}
