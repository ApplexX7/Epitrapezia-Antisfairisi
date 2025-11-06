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

    // Update ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision
    if (ball.y > 250 || ball.y < -250) ball.dy *= -1;

    // Paddle collision
    const leftPlayer = players[0];
    const rightPlayer = players[1];
    const leftY = paddles[leftPlayer.user.id];
    const rightY = paddles[rightPlayer.user.id];

    if (ball.x < -380 && Math.abs(ball.y - leftY) < 80) ball.dx *= -1;
    if (ball.x > 380 && Math.abs(ball.y - rightY) < 80) ball.dx *= -1;

    // Emit game state
    // Emit game state along with player order so clients can map left/right consistently
    io.to(room.id).emit("gameState", {
      ball,
      paddles,
      playerOrder: [leftPlayer.user.id, rightPlayer.user.id], // [leftId, rightId]
    });
  }, 1000 / 60);

  // Stop loop on disconnect
  room.players.forEach((s) => {
    s.once("disconnect", () => clearInterval(interval));
  });
}
