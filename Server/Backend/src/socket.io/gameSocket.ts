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
      ball: { x: 0, y: 0, dx: 8, dy: 8 },
      paddles: {
        [socket.user.id]: 0,
        [opponent.user.id]: 0,
      },
      scores: {
        [socket.user.id]: 0,
        [opponent.user.id]: 0,
      },
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
    const step = 20;
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
  const interval = setInterval(() => {
  const { ball, paddles, players } = room;
    // Move the ball using sub-steps to avoid tunneling when speed is high.
    // This ensures collisions are detected even when dx/dy are large.
    const maxDelta = Math.max(Math.abs(ball.dx), Math.abs(ball.dy));
    const subSteps = Math.max(1, Math.ceil(maxDelta / 8));

    let scored = false;
    const leftPlayer = players[0];
    const rightPlayer = players[1];

    for (let step = 0; step < subSteps; step++) {
      const sx = ball.dx / subSteps;
      const sy = ball.dy / subSteps;

      ball.x += sx;
      ball.y += sy;

      // Wall collision (top/bottom)
      if (ball.y > 250 || ball.y < -250) ball.dy *= -1;

      const leftY = paddles[leftPlayer.user.id] ?? 0;
      const rightY = paddles[rightPlayer.user.id] ?? 0;

      // Paddle collision (check each sub-step)
      if (ball.x < -380 && Math.abs(ball.y - leftY) < 80) {
        ball.dx *= -1;
        // reflect remaining substep movement
        continue;
      }
      if (ball.x > 380 && Math.abs(ball.y - rightY) < 80) {
        ball.dx *= -1;
        continue;
      }

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
      // Reset ball to center and slightly increase speed
      ball.x = 0;
      ball.y = 0;
      // boost speed but keep sign
      ball.dx = (ball.dx >= 0 ? 1 : -1) * Math.abs(ball.dx) * 1.12;
      ball.dy = (ball.dy >= 0 ? 1 : -1) * Math.abs(ball.dy) * 1.12;

      // Check win condition: first to >5 with at least 2 point lead
      const leftScore = room.scores[leftPlayer.user.id] ?? 0;
      const rightScore = room.scores[rightPlayer.user.id] ?? 0;

      if ((leftScore > 5 || rightScore > 5) && Math.abs(leftScore - rightScore) >= 2) {
        const winner = leftScore > rightScore ? leftPlayer.user.username : rightPlayer.user.username;
        io.to(room.id).emit("gameOver", { message: `${winner} wins!` });
        clearInterval(interval);
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
