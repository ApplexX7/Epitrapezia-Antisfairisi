import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { db, ensureTicTacToeStatsForPlayer } from "../databases/db";
import { UserSocket } from "./gameSocket";

interface TicTacToeRoom {
  id: string;
  players: UserSocket[];
  board: (string | null)[];
  currentTurn: number; // player index (0 or 1)
  scores: { [userId: number]: number };
  playerSymbols: { [userId: number]: "X" | "O" };
  recorded?: boolean;
  recording?: boolean; // Lock to prevent concurrent DB writes
  roundWinner?: number | null;
  gameOver?: boolean;
}

let tictactoeMatchmakingQueue: UserSocket[] = [];
const activeTicTacToeRooms: Record<string, TicTacToeRoom> = {};

function leaveAllTicTacToeRooms(player: UserSocket, keepRoomId?: string) {
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

// Function to update player level based on experience
function updateLevel(playerId: number) {
  db.get(
    `SELECT experience FROM players WHERE id = ?`,
    [playerId],
    (err, row: { experience: number }) => {
      if (err) {
        console.error("Error getting experience:", err);
        return;
      }
      const experience = row.experience;
      const newLevel = Math.floor(experience / 100) + 1;
      
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
  return board.every((cell) => cell !== null);
}

async function recordTicTacToeMatchResult(room: TicTacToeRoom, winnerId: number, loserId: number): Promise<boolean> {
  // Race condition guards: check both flags atomically
  if (room.recorded || room.recording) return false;
  room.recording = true;
  
  try {
    // Validate player IDs
    if (!winnerId || !loserId || winnerId === loserId) {
      console.error('Invalid player IDs for TicTacToe match result:', { winnerId, loserId, roomId: room.id });
      return false;
    }

    await ensureTicTacToeStatsForPlayer(winnerId);
    await ensureTicTacToeStatsForPlayer(loserId);

    // Update winner stats in tictactoe_stats table
    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE tictactoe_stats SET total_games = total_games + 1, wins = wins + 1, updated_at = CURRENT_TIMESTAMP WHERE player_id = ?`,
        [winnerId],
        (err: any) => (err ? reject(err) : resolve())
      );
    });

    // Update loser stats in tictactoe_stats table
    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE tictactoe_stats SET total_games = total_games + 1, losses = losses + 1, updated_at = CURRENT_TIMESTAMP WHERE player_id = ?`,
        [loserId],
        (err: any) => (err ? reject(err) : resolve())
      );
    });

    // Add XP for games played and wins
    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE players SET experience = experience + 5 WHERE id = ?`,
        [loserId],
        (err: any) => (err ? reject(err) : resolve())
      );
    });
    
    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE players SET experience = experience + 15 WHERE id = ?`,
        [winnerId],
        (err: any) => (err ? reject(err) : resolve())
      );
    });

    // Update levels for both players
    updateLevel(winnerId);
    updateLevel(loserId);

    // Insert to tictactoe_history table
    const p1Id = room.players[0]?.user?.id;
    const p2Id = room.players[1]?.user?.id;
    
    if (!p1Id || !p2Id) {
      console.error('Missing player IDs for TicTacToe game history:', { p1Id, p2Id, roomId: room.id });
    } else {
      const p1Score = room.scores[p1Id] ?? 0;
      const p2Score = room.scores[p2Id] ?? 0;

      // Ensure winner_id is correct based on scores
      let resolvedWinner = winnerId;
      if (p1Score > p2Score) resolvedWinner = p1Id;
      else if (p2Score > p1Score) resolvedWinner = p2Id;

      await new Promise<void>((resolve, reject) => {
        db.run(
          `INSERT INTO tictactoe_history (player1_id, player2_id, player1_score, player2_score, winner_id) VALUES (?, ?, ?, ?, ?)`,
          [p1Id, p2Id, p1Score, p2Score, resolvedWinner],
          (err: any) => (err ? reject(err) : resolve())
        );
      });
    }

    // Mark as successfully recorded
    room.recorded = true;
    return true;
  } catch (e) {
    console.error('Failed to record tictactoe match result for room', room.id, e);
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
  if (!playerX?.user?.id || !playerO?.user?.id) return null;
  if (playerX.user.id === playerO.user.id) return null;

  const roomId = `ttt-room-${uuidv4()}`;
  const room: TicTacToeRoom = {
    id: roomId,
    players: [playerX, playerO],
    board: Array(9).fill(null),
    currentTurn: 0, // playerX starts
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

  // Remove both from matchmaking queue
  tictactoeMatchmakingQueue = tictactoeMatchmakingQueue.filter(
    (s) => s.id !== playerX.id && s.id !== playerO.id
  );

  // Clean up old room memberships
  leaveAllTicTacToeRooms(playerX, roomId);
  leaveAllTicTacToeRooms(playerO, roomId);

  playerX.join(roomId);
  playerO.join(roomId);

  const [xAvatar, oAvatar] = await Promise.all([
    getAvatar(playerX.user.id),
    getAvatar(playerO.user.id),
  ]);

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

  console.log(
    `🎮 TicTacToe Room created: ${roomId} (${playerX.user.username} [X] vs ${playerO.user.username} [O])`
  );

  // Send initial game state
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
  // Join TicTacToe matchmaking
  socket.on("ttt:joinMatchup", async () => {
    console.log(`🎮 ${socket.user.username} joined TicTacToe matchmaking`);

    const alreadyInQueue = tictactoeMatchmakingQueue.some(
      (s) => s.id === socket.id
    );

    if (alreadyInQueue) {
      console.log(`⚠️ ${socket.user.username} already in TicTacToe matchmaking, stopping...`);
      socket.emit("ttt:stopMatchmaking", { message: "Matchmaking cancelled" });
      tictactoeMatchmakingQueue = tictactoeMatchmakingQueue.filter((s) => s.id !== socket.id);
      return;
    }

    tictactoeMatchmakingQueue.push(socket);
    socket.emit("ttt:waiting", { message: "Searching for opponent..." });

    // Try to match with another player
    const opponent = tictactoeMatchmakingQueue.find((s) => s.user.id !== socket.user.id);
    if (!opponent) return;

    await createTicTacToeRoom(io, socket, opponent);
  });

  // Handle a move
  socket.on("ttt:makeMove", async ({ roomId, index }: { roomId: string; index: number }) => {
    const room = activeTicTacToeRooms[roomId];
    if (!room) {
      socket.emit("ttt:error", { message: "Room not found" });
      return;
    }

    // Verify the sender is a participant
    const playerIndex = room.players.findIndex((p) => p.id === socket.id);
    if (playerIndex === -1) {
      console.warn(`Unauthorized ttt:makeMove from ${socket.user?.username} for room ${roomId}`);
      socket.emit("ttt:error", { message: "Not a participant in this game" });
      return;
    }

    // Check if game is already over or being recorded
    if (room.gameOver || room.recorded || room.recording) {
      socket.emit("ttt:error", { message: "Game is already over" });
      return;
    }

    // Check if round is already decided (waiting for next round)
    if (room.roundWinner !== null && room.roundWinner !== undefined) {
      socket.emit("ttt:error", { message: "Round already ended, wait for next round" });
      return;
    }

    // Check if it's this player's turn
    if (room.currentTurn !== playerIndex) {
      socket.emit("ttt:error", { message: "Not your turn!" });
      return;
    }

    // Validate index
    if (typeof index !== 'number' || index < 0 || index > 8) {
      socket.emit("ttt:error", { message: "Invalid cell index" });
      return;
    }

    // Check if cell is empty
    if (room.board[index] !== null) {
      socket.emit("ttt:error", { message: "Cell already taken!" });
      return;
    }

    // Make the move
    const symbol = room.playerSymbols[socket.user.id];
    room.board[index] = symbol;

    // Check for winner
    const winResult = checkWinner(room.board);
    const isDraw = !winResult && isBoardFull(room.board);

    if (winResult) {
      // Update score
      room.scores[socket.user.id] = (room.scores[socket.user.id] ?? 0) + 1;
      room.roundWinner = socket.user.id;

      // Check if match is over (first to 3)
      if (room.scores[socket.user.id] >= 3) {
        room.gameOver = true;
        const loser = room.players.find((p) => p.user.id !== socket.user.id);
        const loserId = loser?.user.id;
        
        if (loserId) {
          // Record match result - only winner and loser stored
          try {
            await recordTicTacToeMatchResult(room, socket.user.id, loserId);
          } catch (e) {
            console.error('Failed to record TicTacToe match result:', e);
          }
        } else {
          console.error('Could not find loser for TicTacToe match:', roomId);
        }

        io.to(roomId).emit("ttt:gameState", {
          board: room.board,
          currentTurn: null,
          scores: room.scores,
          playerSymbols: room.playerSymbols,
          winner: { 
            oderId: socket.user.id, 
            line: winResult.line,
            username: socket.user.username 
          },
          isDraw: false,
          matchOver: true,
          matchWinner: {
            id: socket.user.id,
            username: socket.user.username,
          },
        });

        // Clean up room after a delay
        setTimeout(() => {
          if (activeTicTacToeRooms[roomId]) {
            delete activeTicTacToeRooms[roomId];
          }
        }, 5000);

        return;
      }
    }

    // Switch turn (only if round not won - draw or continuing play)
    if (!winResult) {
      room.currentTurn = room.currentTurn === 0 ? 1 : 0;
    }
    const nextPlayer = room.players[room.currentTurn];

    io.to(roomId).emit("ttt:gameState", {
      board: room.board,
      currentTurn: winResult ? null : (nextPlayer?.user.id ?? null),
      scores: room.scores,
      playerSymbols: room.playerSymbols,
      winner: winResult ? { 
        oderId: socket.user.id, 
        line: winResult.line,
        username: socket.user.username 
      } : null,
      isDraw,
      matchOver: false,
    });
  });

  // Handle next round request
  socket.on("ttt:nextRound", ({ roomId }: { roomId: string }) => {
    const room = activeTicTacToeRooms[roomId];
    if (!room) {
      socket.emit("ttt:error", { message: "Room not found" });
      return;
    }

    const playerIndex = room.players.findIndex((p) => p.id === socket.id);
    if (playerIndex === -1) {
      socket.emit("ttt:error", { message: "Not a participant in this game" });
      return;
    }

    if (room.gameOver) {
      socket.emit("ttt:error", { message: "Game is already over" });
      return;
    }

    // Reset board for next round
    room.board = Array(9).fill(null);
    room.roundWinner = null;
    
    // Alternate who starts
    room.currentTurn = room.currentTurn === 0 ? 1 : 0;
    const nextPlayer = room.players[room.currentTurn];

    io.to(roomId).emit("ttt:gameState", {
      board: room.board,
      currentTurn: nextPlayer?.user.id ?? null,
      scores: room.scores,
      playerSymbols: room.playerSymbols,
      winner: null,
      isDraw: false,
      matchOver: false,
    });
  });

  // Handle explicit leave game (player navigates away, clicks leave, etc.)
  socket.on("ttt:leaveGame", async ({ roomId }: { roomId: string }) => {
    const room = activeTicTacToeRooms[roomId];
    if (!room) return;

    const playerIndex = room.players.findIndex((p) => p.id === socket.id);
    if (playerIndex === -1) return;

    // Prevent duplicate processing
    if (room.gameOver || room.recorded || room.recording) {
      socket.leave(roomId);
      return;
    }

    console.log(`🚪 ${socket.user.username} left TicTacToe game ${roomId}`);
    room.gameOver = true;

    // Notify opponent and end game
    const other = room.players.find((p) => p.id !== socket.id);
    
    io.to(roomId).emit("ttt:gameOver", {
      message: `${socket.user.username} left the game`,
      disconnected: socket.user.id,
      winner: other ? { id: other.user.id, username: other.user.username } : null
    });

    // Record result: other player wins - only winner and loser stored
    if (other?.user?.id && socket.user?.id) {
      try {
        await recordTicTacToeMatchResult(room, other.user.id, socket.user.id);
      } catch (e) {
        console.error('Error recording TicTacToe leave result:', e);
      }
    }

    // Leave socket room
    try {
      socket.leave(roomId);
    } catch (e) {
      // Socket may already be disconnected
    }
    
    // Clean up the room
    delete activeTicTacToeRooms[roomId];
  });

  // Handle forfeit/surrender
  socket.on("ttt:forfeit", async ({ roomId }: { roomId: string }) => {
    const room = activeTicTacToeRooms[roomId];
    if (!room) return;

    const playerIndex = room.players.findIndex((p) => p.id === socket.id);
    if (playerIndex === -1) return;

    // Prevent duplicate processing
    if (room.gameOver || room.recorded || room.recording) {
      return;
    }

    console.log(`🏳️ ${socket.user.username} forfeited TicTacToe game ${roomId}`);
    room.gameOver = true;

    const other = room.players.find((p) => p.id !== socket.id);

    io.to(roomId).emit("ttt:gameOver", {
      message: `${socket.user.username} forfeited the match`,
      disconnected: socket.user.id,
      winner: other ? { id: other.user.id, username: other.user.username } : null,
      forfeit: true
    });

    // Record result: other player wins - only winner and loser stored
    if (other?.user?.id && socket.user?.id) {
      try {
        await recordTicTacToeMatchResult(room, other.user.id, socket.user.id);
      } catch (e) {
        console.error('Error recording TicTacToe forfeit result:', e);
      }
    }

    delete activeTicTacToeRooms[roomId];
  });

  // Handle disconnect
  socket.on("disconnect", async () => {
    // Remove from matchmaking queue
    const idx = tictactoeMatchmakingQueue.indexOf(socket);
    if (idx !== -1) tictactoeMatchmakingQueue.splice(idx, 1);

    // Handle active room disconnect
    for (const [id, room] of Object.entries(activeTicTacToeRooms)) {
      const playerIndex = room.players.findIndex((p) => p.id === socket.id);
      if (playerIndex !== -1) {
        // Prevent duplicate processing - check all race condition flags
        if (room.gameOver || room.recorded || room.recording) {
          // Room already being processed, just clean up
          delete activeTicTacToeRooms[id];
          continue;
        }

        room.gameOver = true;

        io.to(id).emit("ttt:gameOver", { 
          message: `${socket.user.username} disconnected`,
          disconnected: socket.user.id 
        });

        // Record result: other player wins - only winner and loser stored
        const other = room.players.find((p) => p.id !== socket.id);
        if (other?.user?.id && socket.user?.id) {
          try {
            await recordTicTacToeMatchResult(room, other.user.id, socket.user.id);
          } catch (e) {
            console.error('Error recording TicTacToe disconnect result for room', id, e);
          }
        }

        delete activeTicTacToeRooms[id];
      }
    }
  });

  // Allow rejoining a room
  socket.on("ttt:joinRoom", async (data: any, callback?: Function) => {
    const { roomId } = data || {};
    if (!roomId || typeof roomId !== "string") {
      if (callback) callback({ ok: false, error: "Missing roomId" });
      return;
    }

    const room = activeTicTacToeRooms[roomId];
    if (!room) {
      if (callback) callback({ ok: false, error: "Room not found" });
      return;
    }

    const idx = room.players.findIndex((p) => p.user.id === socket.user.id);
    if (idx === -1) {
      if (callback) callback({ ok: false, error: "Not a participant" });
      return;
    }

    const oldSocket = room.players[idx];
    if (oldSocket && oldSocket.id !== socket.id) {
      try {
        oldSocket.leave(roomId);
      } catch {}
    }
    room.players[idx] = socket;
    leaveAllTicTacToeRooms(socket, roomId);
    socket.join(roomId);

    const opponent = room.players[idx === 0 ? 1 : 0];
    const opponentAvatar = opponent ? await getAvatar(opponent.user.id) : "/images/player2.png";

    socket.emit("ttt:matched", {
      opponent: opponent
        ? { id: opponent.user.id, username: opponent.user.username, avatar: opponentAvatar }
        : { id: -1, username: "Opponent", avatar: opponentAvatar },
      symbol: room.playerSymbols[socket.user.id],
      roomId,
    });

    // Send current game state
    const currentPlayer = room.players[room.currentTurn];
    socket.emit("ttt:gameState", {
      board: room.board,
      currentTurn: currentPlayer?.user.id ?? null,
      scores: room.scores,
      playerSymbols: room.playerSymbols,
      winner: null,
      isDraw: false,
      matchOver: room.gameOver ?? false,
    });

    if (callback) callback({ ok: true, roomId });
  });
}
