import { Server, Socket } from "socket.io";

interface UserSocket extends Socket {
  user: {
    id: number;
    username: string;
  };
}

// global matchmaking queue: one entry per user
const matchmakingQueue: Record<number, UserSocket> = {};

export function registerGameSocket(io: Server, socket: UserSocket, onlineUsers: Record<number, any[]>) {
  socket.on("joinmatchup", () => {
    const userId = socket.user.id;

    // if user is already in queue, ignore
    if (matchmakingQueue[userId]) {
      socket.emit("waiting", { message: "You are already in the queue" });
      return;
    }

    // add user to queue
    matchmakingQueue[userId] = socket;
    socket.emit("waiting", { message: "Searching for an opponent..." });

    // try to match with any other user
    const otherUserId = Object.keys(matchmakingQueue)
      .map(Number)
      .find(id => id !== userId);

    if (otherUserId !== undefined) {
      const opponentSocket = matchmakingQueue[otherUserId];

      // emit matched to both users
      socket.emit("matched", { opponent: opponentSocket.user.username });
      opponentSocket.emit("matched", { opponent: socket.user.username });

      // remove both from queue
      delete matchmakingQueue[userId];
      delete matchmakingQueue[otherUserId];
    }
  });

  socket.on("disconnect", () => {
    const userId = socket.user.id;
    if (matchmakingQueue[userId] === socket) {
      delete matchmakingQueue[userId];
    }
  });
}
