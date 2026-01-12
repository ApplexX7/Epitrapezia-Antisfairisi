import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import { db, ensureGameStatsForPlayer } from "../databases/db";

export interface UserSocket extends Socket {
  user: {
    id: number;
    username: string;
    avatar: string;
  };
}

interface GameRoom {
  id: string;
  players: UserSocket[];
  ball: { x: number; y: number; dx: number; dy: number };
  baseSpeed?: { dx: number; dy: number };
  roundStart?: number;
  paddles: { [userId: number]: number };
  scores: { [userId: number]: number };
  paddleStep?: number;
  loop?: ReturnType<typeof setInterval> | null;
  recorded?: boolean; // no race condition for db error
}

let matchmakingQueue: UserSocket[] = [];
const activeRooms: Record<string, GameRoom> = {};

function leaveAllGameRooms(player: UserSocket, keepRoomId?: string) {
  try {
    for (const r of player.rooms) {
      if (r === player.id) continue;
      if (keepRoomId && r === keepRoomId) continue;
      if (typeof r === "string" && r.startsWith("room-")) {
        try {
          player.leave(r);
        } catch {}
      }
    }
  } catch {}
}

async function getAvatar(userId: number) {
  return new Promise<string>((resolve) => {
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

export async function createRoomAndStartGame(
  io: Server,
  leftPlayer: UserSocket,
  rightPlayer: UserSocket
): Promise<{ roomId: string } | null> {
  if (!leftPlayer?.user?.id || !rightPlayer?.user?.id) return null;
  if (leftPlayer.user.id === rightPlayer.user.id) return null;

  const roomId = `room-${uuidv4()}`;
  const room: GameRoom = {
    id: roomId,
    players: [leftPlayer, rightPlayer],
    // start with a slightly reduced ball speed
    ball: { x: 0, y: 0, dx: 6, dy: 6 },
    baseSpeed: { dx: 6, dy: 6 },
    roundStart: Date.now(),
    paddles: {
      [leftPlayer.user.id]: 0,
      [rightPlayer.user.id]: 0,
    },
    scores: {
      [leftPlayer.user.id]: 0,
      [rightPlayer.user.id]: 0,
    },
    paddleStep: 24,
    loop: null,
  };

  activeRooms[roomId] = room;

  // Remove both participants from matchmaking queue if present
  matchmakingQueue = matchmakingQueue.filter(
    (s) => s.id !== leftPlayer.id && s.id !== rightPlayer.id
  );

  // Make sure each socket only participates in one game room at a time.
  leaveAllGameRooms(leftPlayer, roomId);
  leaveAllGameRooms(rightPlayer, roomId);

  leftPlayer.join(roomId);
  rightPlayer.join(roomId);

  const [leftAvatar, rightAvatar] = await Promise.all([
    getAvatar(leftPlayer.user.id),
    getAvatar(rightPlayer.user.id),
  ]);

  leftPlayer.emit("matched", {
    opponent: {
      id: rightPlayer.user.id,
      username: rightPlayer.user.username,
      avatar: rightAvatar,
    },
    role: "left",
    roomId,
  });

  rightPlayer.emit("matched", {
    opponent: {
      id: leftPlayer.user.id,
      username: leftPlayer.user.username,
      avatar: leftAvatar,
    },
    role: "right",
    roomId,
  });

  console.log(
    `🏓 Room created: ${roomId} (${leftPlayer.user.username} vs ${rightPlayer.user.username})`
  );
  startGameLoop(io, room);
  return { roomId };
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
      // Level calculation: level = floor(experience / 100) + 1
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
// avoid race 
async function recordMatchResult(io: Server, room: GameRoom, winnerId: number, loserId: number) {
  if (room.recorded) return;
  room.recorded = true;
  try {
    await ensureGameStatsForPlayer(winnerId);
    await ensureGameStatsForPlayer(loserId);
    
    // Get player levels for XP calculation
    const winnerLevel: any = await new Promise((resolve, reject) => {
      db.get(
        `SELECT level FROM players WHERE id = ?`,
        [winnerId],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });
    
    const loserLevel: any = await new Promise((resolve, reject) => {
      db.get(
        `SELECT level FROM players WHERE id = ?`,
        [loserId],
        (err, row) => (err ? reject(err) : resolve(row))
      );
    });
    
    const winnerLvl = winnerLevel?.level || 1;
    const loserLvl = loserLevel?.level || 1;
    
    // Calculate XP: fixed values per game
    // Loser gets 10 XP, Winner gets 20 XP
    const loserXp = 10;
    const winnerXp = 20;
    
    // update winner stats
    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE game_stats SET total_games = total_games + 1, wins = wins + 1, updated_at = CURRENT_TIMESTAMP WHERE player_id = ?`,
        [winnerId],
        (err: any) => (err ? reject(err) : resolve())
      );
    });

    // update loser stats
    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE game_stats SET total_games = total_games + 1, losses = losses + 1, updated_at = CURRENT_TIMESTAMP WHERE player_id = ?`,
        [loserId],
        (err: any) => (err ? reject(err) : resolve())
      );
    });

    // Add XP for games played
    // Loser gets base XP for playing
    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE players SET experience = experience + ? WHERE id = ?`,
        [loserXp, loserId],
        (err: any) => (err ? reject(err) : resolve())
      );
    });
    
    // Winner gets higher XP bonus
    await new Promise<void>((resolve, reject) => {
      db.run(
        `UPDATE players SET experience = experience + ? WHERE id = ?`,
        [winnerXp, winnerId],
        (err: any) => (err ? reject(err) : resolve())
      );
    });

    // Log XP gains to xp_history table
    const today = new Date().toISOString().split('T')[0];
    
    // Log winner XP
    await new Promise<void>((resolve, reject) => {
      db.run(
        `INSERT INTO xp_history (player_id, date, xp_gained, source) 
         VALUES (?, ?, ?, 'game_win')
         ON CONFLICT(player_id, date, source) 
         DO UPDATE SET xp_gained = xp_gained + ?`,
        [winnerId, today, winnerXp, winnerXp],
        (err: any) => (err ? reject(err) : resolve())
      );
    });
    
    // Log loser XP
    await new Promise<void>((resolve, reject) => {
      db.run(
        `INSERT INTO xp_history (player_id, date, xp_gained, source) 
         VALUES (?, ?, ?, 'game_loss')
         ON CONFLICT(player_id, date, source) 
         DO UPDATE SET xp_gained = xp_gained + ?`,
        [loserId, today, loserXp, loserXp],
        (err: any) => (err ? reject(err) : resolve())
      );
    });

    // Update levels for both players
    updateLevel(winnerId);
    updateLevel(loserId);

    // Emit XP update events to both players
    io.to(String(winnerId)).emit("xp:gained", { xpAwarded: winnerXp, type: "game_win" });
    io.to(String(winnerId)).emit("xp:updated", { xpAwarded: winnerXp });
    io.to(String(loserId)).emit("xp:gained", { xpAwarded: loserXp, type: "game_loss" });
    io.to(String(loserId)).emit("xp:updated", { xpAwarded: loserXp });

    // insert to game historiy
    try {
      const p1Id = room.players[0]?.user?.id;
      const p2Id = room.players[1]?.user?.id;
      const p1Score = room.scores[p1Id] ?? 0;
      const p2Score = room.scores[p2Id] ?? 0;
      // make sure winnerid is set
      let resolvedWinner = winnerId;
      if (!resolvedWinner) {
        if (p1Score > p2Score) resolvedWinner = p1Id;
        else if (p2Score > p1Score) resolvedWinner = p2Id;
        else resolvedWinner = loserId === p1Id ? p2Id : p1Id;
      }

      await new Promise<void>((resolve, reject) => {
        db.run(
          `INSERT INTO game_history (player1_id, player2_id, player1_score, player2_score, winner_id) VALUES (?, ?, ?, ?, ?)`,
          [p1Id, p2Id, p1Score, p2Score, resolvedWinner],
          (err: any) => (err ? reject(err) : resolve())
        );
      });
    } catch (e) {
      console.error('Failed to insert into game_history for room', room.id, e || e);
    }
  } catch (e) {
    console.error('Failed to record match result for room', room.id, e);
  }
}

export function registerGameSocket(io: Server, socket: UserSocket) {
  socket.on("joinmatchup", async () => {
    console.log(`🎮 ${socket.user.username} joined matchmaking`);

    // add to queue

    const alreadyInQueue = matchmakingQueue.some(
      (s) => s.id === socket.id
    );
  
    if (alreadyInQueue) {
      console.log(`⚠️ ${socket.user.username} already in matchmaking, stopping...`);
      socket.emit("stopmatchmaking", { message: "Matchmaking cancelled" });
      // optionally remove from queue
      matchmakingQueue = matchmakingQueue.filter((s) => s.id !== socket.id);
      return;
    }
  
    // add to queue
    matchmakingQueue.push(socket);
    socket.emit("waiting", { message: "searching for opponent" });
  
    // match with first diff user
    const opponent = matchmakingQueue.find((s) => s.user.id !== socket.user.id);
    if (!opponent) return;

    await createRoomAndStartGame(io, socket, opponent);
  });

  socket.on("movePaddle", ({ roomId, direction }: { roomId: string; direction: "up" | "down" }) => {
    const room = activeRooms[roomId];
    if (!room) return;

    // ensure the sender is actually a participant in this room (by socket id)
    // so only the currently-bound tab controls the paddle.
    const isParticipant = room.players.some((p) => p.id === socket.id);
    if (!isParticipant) {
      console.warn(`Unauthorized movePaddle from user ${socket.user?.username} for room ${roomId}`);
      return;
    }

    const current = room.paddles[socket.user.id] ?? 0;
    const step = room.paddleStep ?? 24;
    let next = current;
    if (direction === "up") next = current - step;
    else if (direction === "down") next = current + step;

    // Clamp paddle movement so it stays within visible play area.
    // Board height is 500px, center=0, paddle half-height ~=50 -> max offset = 250 - 50 = 200
    const clamp = (v: number, min = -200, max = 200) => Math.max(min, Math.min(max, v));
    room.paddles[socket.user.id] = clamp(next);
  });

  socket.on("disconnect", () => {
    // remove from rooms
    for (const [id, room] of Object.entries(activeRooms)) {
      if (room.players.includes(socket)) {
        io.to(id).emit("gameOver", { message: `${socket.user.username} disconnected` });
        // mark result: other player wins best-effort
        try {
          const other = room.players.find((p) => p.id !== socket.id);
          if (other && !room.recorded) {
            // record winner=other, loser=socket (best-effort)
            recordMatchResult(io, room, other.user.id, socket.user.id).catch((e) => {
              console.error('Error recording disconnect result (top-level) for room', id, e || e);
            });
          }
        } catch (e) {
          console.error('Error handling disconnect for room', id, e);
        }

        // clear any running loop for this room to avoid leaked intervals
        try {
          if (room.loop) clearInterval(room.loop as any);
        } catch (e) {}
        delete activeRooms[id];
      }
    }

    // remove from queue if waiting
    const idx = matchmakingQueue.indexOf(socket);
    if (idx !== -1) matchmakingQueue.splice(idx, 1);
  });

  // Allows a participant to re-attach their current socket to an existing room.
  // This fixes cases where a user navigates late / has multiple tabs.
  socket.on("game:joinRoom", async (data: any, callback?: Function) => {
    const { roomId } = data || {};
    if (!roomId || typeof roomId !== "string") {
      if (callback) callback({ ok: false, error: "Missing roomId" });
      return;
    }

    const room = activeRooms[roomId];
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
    // Ensure this socket won't receive gameState from other game rooms.
    leaveAllGameRooms(socket, roomId);
    socket.join(roomId);

    const opponent = room.players[idx === 0 ? 1 : 0];
    const opponentAvatar = opponent ? await getAvatar(opponent.user.id) : "/images/player2.png";

    socket.emit("matched", {
      opponent: opponent
        ? { id: opponent.user.id, username: opponent.user.username, avatar: opponentAvatar }
        : { id: -1, username: "Opponent", avatar: opponentAvatar },
      role: idx === 0 ? "left" : "right",
      roomId,
    });

    if (callback) callback({ ok: true, roomId });
  });
}

function startGameLoop(io: Server, room: GameRoom) {
  // clear any existing loop restart
  if (room.loop) {
    clearInterval(room.loop as any);
    room.loop = null;
  }
  const SPEED_ADD_PER_SECOND = 0.2; // px per second added to each component's magnitude

  const interval = setInterval(() => {
    const { ball, paddles, players } = room;

    // compute current per round elapsed and derive the effective ball velocity
    const now = Date.now();
    const roundStart = room.roundStart ?? now;
    const elapsedSec = Math.max(0, (now - roundStart) / 1000);
    const addPerSec = SPEED_ADD_PER_SECOND;

      // if basespeed doesnt exist
    if (!room.baseSpeed) room.baseSpeed = { dx: ball.dx, dy: ball.dy };

    const base = room.baseSpeed;
    // current effective magnitudes (additive growth over time)
    const effDx = Math.sign(base.dx) * (Math.abs(base.dx) + elapsedSec * addPerSec);
    const effDy = Math.sign(base.dy) * (Math.abs(base.dy) + elapsedSec * addPerSec);

    // apply to the ball for this tick 
    ball.dx = effDx;
    ball.dy = effDy;

    // move the ball using sub-steps to avoid tunneling when speed is high.
    // this ensures collisions are detected even when dx/dy are large.
  const maxDelta = Math.max(Math.abs(ball.dx), Math.abs(ball.dy));
  // increase sub steps resolution to avoid tunneling at high speeds
  const subSteps = Math.max(1, Math.ceil(maxDelta / 4));

    let scored = false;
    const leftPlayer = players[0];
    const rightPlayer = players[1];

    for (let step = 0; step < subSteps; step++) {
      const sx = ball.dx / subSteps;
      const sy = ball.dy / subSteps;
      const prevX = ball.x;
      const prevY = ball.y;

      const leftY = paddles[leftPlayer.user.id] ?? 0;
      const rightY = paddles[rightPlayer.user.id] ?? 0;

      // geometry constants (match client): paddle width and ball size
      const paddleWidth = 19; // px
      const paddleHalfH = 80; // vertical half-height used earlier
      const ballRadius = 12; // ball diameter 24px -> radius 12

      // paddle center X positions
      const leftPaddleCenterX = -400 + paddleWidth / 2; // -390.5
      const rightPaddleCenterX = 400 - paddleWidth / 2; // 390.5

      // paddle face X (outer edge matching visual paddle face)
      const leftFaceX = leftPaddleCenterX + paddleWidth / 2; // -381
      const rightFaceX = rightPaddleCenterX - paddleWidth / 2; // 381

      // collision plane for ball center (ball touches paddle when center reaches face +/- radius)
      const leftCollisionX = leftFaceX + ballRadius; // -369
      const rightCollisionX = rightFaceX - ballRadius; // 369

      let collided = false;

      // check left paddle crossing (ball moving left)
      if (sx < 0 && prevX >= leftCollisionX && prevX + sx <= leftCollisionX) {
        const t = (leftCollisionX - prevX) / sx; // fraction along this substep
        const impactY = prevY + sy * t;
        if (Math.abs(impactY - leftY) <= paddleHalfH) {
          // collision: place ball center at collision X and set y to impactY, reflect dx
          ball.x = leftCollisionX;
          ball.y = impactY;
          ball.dx = Math.abs(ball.dx);
          // reflect baseSpeed sign so future additive growth keeps direction
          if (room.baseSpeed) room.baseSpeed.dx = Math.abs(room.baseSpeed.dx);
          collided = true;
        }
      }

      // check right paddle crossing (ball moving right)
      if (!collided && sx > 0 && prevX <= rightCollisionX && prevX + sx >= rightCollisionX) {
        const t = (rightCollisionX - prevX) / sx;
        const impactY = prevY + sy * t;
        if (Math.abs(impactY - rightY) <= paddleHalfH) {
          ball.x = rightCollisionX;
          ball.y = impactY;
          ball.dx = -Math.abs(ball.dx);
          if (room.baseSpeed) room.baseSpeed.dx = -Math.abs(room.baseSpeed.dx);
          collided = true;
        }
      }

      if (collided) {
        // continue to next substep after collision (prevents tunneling)
        continue;
      }

      // No paddle collision this substep: advance normally
      ball.x += sx;
      ball.y += sy;

      // wall collision (top/bottom) - account for ball radius so the bounce
      // occurs when the ball's outer edge (corner) hits the board limits,
      // not when its center reaches them.
      const boardHalfH = 250; // half the board height (visual: 500px)
      if (ball.y > boardHalfH - ballRadius || ball.y < -boardHalfH + ballRadius) {
        ball.dy *= -1;
        if (room.baseSpeed) room.baseSpeed.dy *= -1;
      }

      // goal detection: if ball passes beyond playable area, award point to opponent
      const leftGoal = -400 - ballRadius; // require ball fully past left edge
      const rightGoal = 400 + ballRadius;

      if (ball.x <= leftGoal) {
        // right player scores
        room.scores[rightPlayer.user.id] = (room.scores[rightPlayer.user.id] ?? 0) + 1;
        scored = true;
      } else if (ball.x >= rightGoal) {
        // left player scores
        room.scores[leftPlayer.user.id] = (room.scores[leftPlayer.user.id] ?? 0) + 1;
        scored = true;
      }

      if (scored) break;
    }

    if (scored) {
      // pause the loop and send a 3-second countdown to clients
      try { if (room.loop) clearInterval(room.loop as any); } catch (e) {}
      room.loop = null;

      // send immediate updated gameState with ball centered
      ball.x = 0;
      ball.y = 0;
      io.to(room.id).emit("gameState", {
        ball,
        paddles,
        scores: room.scores,
        playerOrder: [leftPlayer.user.id, rightPlayer.user.id],
      });

      // countdown: 3 -> 1
      let countdown = 3;
      const countdownInterval = setInterval(() => {
        io.to(room.id).emit("countdown", { remaining: countdown });
        countdown -= 1;
        if (countdown === 0) {
          clearInterval(countdownInterval);

          // after countdown, slightly reduce ball speed and increase paddle speed
          const minSpeed = 4;
            // reduce the base speed magnitude so future rounds start a bit slower,
            // then reset the round start so additive growth begins from zero elapsed.
            if (!room.baseSpeed) room.baseSpeed = { dx: ball.dx, dy: ball.dy };
            room.baseSpeed.dx = (room.baseSpeed.dx >= 0 ? 1 : -1) * Math.max(minSpeed, Math.abs(room.baseSpeed.dx) * 0.9);
            room.baseSpeed.dy = (room.baseSpeed.dy >= 0 ? 1 : -1) * Math.max(minSpeed, Math.abs(room.baseSpeed.dy) * 0.9);
            // reset round timer so growth restarts for the next rally
            room.roundStart = Date.now();
            // make ball reflect the new base speed immediately (no elapsed added yet)
            ball.dx = room.baseSpeed.dx;
            ball.dy = room.baseSpeed.dy;

          // Increase paddle responsiveness a bit
          room.paddleStep = Math.min(40, (room.paddleStep ?? 24) + 4);

          // Restart the game loop
          room.loop = null;
          startGameLoop(io, room);
        }
      }, 1000);

      // check win condition: first to >5 with at least 2 point lead
      const leftScore = room.scores[leftPlayer.user.id] ?? 0;
      const rightScore = room.scores[rightPlayer.user.id] ?? 0;

      if ((leftScore > 5 || rightScore > 5) && Math.abs(leftScore - rightScore) >= 2) {
        const winnerId = leftScore > rightScore ? leftPlayer.user.id : rightPlayer.user.id;
        const loserId = leftScore > rightScore ? rightPlayer.user.id : leftPlayer.user.id;

        // record match result in DB (best-effort)
        recordMatchResult(io, room, winnerId, loserId).catch((e) => {
          console.error('Failed to record match result for room', room.id, e || e);
        });

        const loser = leftScore < rightScore ? leftPlayer.user.username : rightPlayer.user.username;
        io.to(room.id).emit("gameOver", { message: `${loser} is underdog!` });
        // ensure countdown cleared and do not restart
        try { clearInterval(countdownInterval); } catch {}
        delete activeRooms[room.id];
        return;
      }
    }

    // mmit game state along with player order and scores so clients can map left/right and display score
    io.to(room.id).emit("gameState", {
      ball,
      paddles,
      scores: room.scores,
      playerOrder: [leftPlayer.user.id, rightPlayer.user.id], // [leftId, rightId]
    });
  }, 1000 / 60);

  // keep a reference on the room for cleanup and allow disconnect handler to clear it
  room.loop = interval;

  // stop loop on disconnect
  room.players.forEach((s) => {
    s.once("disconnect", async () => {
      try { if (room.loop) clearInterval(room.loop as any); } catch (e) {}
      // Determine winner (the other player) and record result
      try {
        const disconnected = s;
        const other = room.players.find(p => p.id !== disconnected.id);
        if (other && !room.recorded) {
          // record other as winner, disconnected as loser
          recordMatchResult(io, room, other.user.id, disconnected.user.id).catch((e) => {
            console.error('Error recording disconnect result for room', room.id, e || e);
          });
        }
      } catch (e) {
        console.error('Error recording disconnect result for room', room.id, e);
      }
    });
  });
}
