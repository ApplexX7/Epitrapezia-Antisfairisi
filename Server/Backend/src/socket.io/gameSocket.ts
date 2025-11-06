import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";

interface UserSocket extends Socket {
  user: {
    id: number;
    username: string;
  };
}

interface GameRoom {
  id: string;
  players: UserSocket[];
  ball: { x: number; y: number; dx: number; dy: number };
  paddles: { [userId: number]: number };
  scores: { [userId: number]: number };
  paddleStep?: number;
  loop?: ReturnType<typeof setInterval> | null;
}

const matchmakingQueue: UserSocket[] = [];
const activeRooms: Record<string, GameRoom> = {};

export function registerGameSocket(io: Server, socket: UserSocket) {
  socket.on("joinmatchup", () => {
    console.log(`🎮 ${socket.user.username} joined matchmaking`);

    // Add to queue
    matchmakingQueue.push(socket);
    socket.emit("waiting", { message: "Searching for opponent..." });

    // Match with first different user
    const opponent = matchmakingQueue.find((s) => s.user.id !== socket.user.id);
    if (!opponent) return;

    const roomId = `room-${uuidv4()}`;
    const room: GameRoom = {
      id: roomId,
      players: [socket, opponent],
      // start with a slightly reduced ball speed compared to before
      ball: { x: 0, y: 0, dx: 6, dy: 6 },
      paddles: {
        [socket.user.id]: 0,
        [opponent.user.id]: 0,
      },
      scores: {
        [socket.user.id]: 0,
        [opponent.user.id]: 0,
      },
      paddleStep: 24,
      loop: null,
    };

    activeRooms[roomId] = room;
    matchmakingQueue.splice(matchmakingQueue.indexOf(socket), 1);
    matchmakingQueue.splice(matchmakingQueue.indexOf(opponent), 1);

    // Join room
    socket.join(roomId);
    opponent.join(roomId);

    // Emit matched
    socket.emit("matched", { opponent: opponent.user.username, role: "left", roomId });
    opponent.emit("matched", { opponent: socket.user.username, role: "right", roomId });

    console.log(`🏓 Room created: ${roomId} (${socket.user.username} vs ${opponent.user.username})`);

    startGameLoop(io, room);
  });

  socket.on("movePaddle", ({ roomId, direction }: { roomId: string; direction: "up" | "down" }) => {
    const room = activeRooms[roomId];
    if (!room) return;

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
    // Remove from rooms
    for (const [id, room] of Object.entries(activeRooms)) {
      if (room.players.includes(socket)) {
        io.to(id).emit("gameOver", { message: `${socket.user.username} disconnected` });
        delete activeRooms[id];
      }
    }

    // Remove from queue if waiting
    const idx = matchmakingQueue.indexOf(socket);
    if (idx !== -1) matchmakingQueue.splice(idx, 1);
  });
}

function startGameLoop(io: Server, room: GameRoom) {
  // clear any existing loop (restart)
  if (room.loop) {
    clearInterval(room.loop as any);
    room.loop = null;
  }

  const interval = setInterval(() => {
    const { ball, paddles, players } = room;
    // Move the ball using sub-steps to avoid tunneling when speed is high.
    // This ensures collisions are detected even when dx/dy are large.
  const maxDelta = Math.max(Math.abs(ball.dx), Math.abs(ball.dy));
  // Increase sub-steps resolution to avoid tunneling at high speeds
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

      // swept collision: check if segment [prevX, prevX+sx] crosses paddle face X
      const leftPaddleX = -390;
      const rightPaddleX = 390;
      const paddleHalfH = 80;

      let collided = false;

      // Check left paddle crossing (ball moving left)
      if (sx < 0 && prevX >= leftPaddleX && prevX + sx <= leftPaddleX) {
        const t = (leftPaddleX - prevX) / sx; // fraction along this substep
        const impactY = prevY + sy * t;
        if (Math.abs(impactY - leftY) <= paddleHalfH) {
          // collision: place ball at paddle face and reflect dx
          ball.x = leftPaddleX;
          ball.y = impactY;
          ball.dx = Math.abs(ball.dx);
          collided = true;
        }
      }

      // Check right paddle crossing (ball moving right)
      if (!collided && sx > 0 && prevX <= rightPaddleX && prevX + sx >= rightPaddleX) {
        const t = (rightPaddleX - prevX) / sx;
        const impactY = prevY + sy * t;
        if (Math.abs(impactY - rightY) <= paddleHalfH) {
          ball.x = rightPaddleX;
          ball.y = impactY;
          ball.dx = -Math.abs(ball.dx);
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

      // Wall collision (top/bottom)
      if (ball.y > 250 || ball.y < -250) ball.dy *= -1;

      // Goal detection: if ball passes beyond playable area, award point to opponent
      const leftGoal = -400;
      const rightGoal = 400;

      if (ball.x <= leftGoal) {
        // Right player scores
        room.scores[rightPlayer.user.id] = (room.scores[rightPlayer.user.id] ?? 0) + 1;
        scored = true;
      } else if (ball.x >= rightGoal) {
        // Left player scores
        room.scores[leftPlayer.user.id] = (room.scores[leftPlayer.user.id] ?? 0) + 1;
        scored = true;
      }

      if (scored) break;
    }

    if (scored) {
      // Pause the loop and send a 3-second countdown to clients
      clearInterval(interval);
      room.loop = null;

      // Send immediate updated gameState with ball centered
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

          // After countdown, slightly reduce ball speed and increase paddle speed
          const minSpeed = 4;
          ball.dx = (ball.dx >= 0 ? 1 : -1) * Math.max(minSpeed, Math.abs(ball.dx) * 0.9);
          ball.dy = (ball.dy >= 0 ? 1 : -1) * Math.max(minSpeed, Math.abs(ball.dy) * 0.9);

          // Increase paddle responsiveness a bit
          room.paddleStep = Math.min(40, (room.paddleStep ?? 24) + 4);

          // Restart the game loop
          room.loop = null;
          startGameLoop(io, room);
        }
      }, 1000);

      // Check win condition: first to >5 with at least 2 point lead
      const leftScore = room.scores[leftPlayer.user.id] ?? 0;
      const rightScore = room.scores[rightPlayer.user.id] ?? 0;

      if ((leftScore > 5 || rightScore > 5) && Math.abs(leftScore - rightScore) >= 2) {
        const winner = leftScore > rightScore ? leftPlayer.user.username : rightPlayer.user.username;
        io.to(room.id).emit("gameOver", { message: `${winner} wins!` });
        // ensure countdown cleared and do not restart
        try { clearInterval(countdownInterval); } catch {}
        delete activeRooms[room.id];
        return;
      }
    }

    // Emit game state along with player order and scores so clients can map left/right and display score
    io.to(room.id).emit("gameState", {
      ball,
      paddles,
      scores: room.scores,
      playerOrder: [leftPlayer.user.id, rightPlayer.user.id], // [leftId, rightId]
    });
  }, 1000 / 60);

  // Stop loop on disconnect
  room.players.forEach((s) => {
    s.once("disconnect", () => clearInterval(interval));
  });
}
