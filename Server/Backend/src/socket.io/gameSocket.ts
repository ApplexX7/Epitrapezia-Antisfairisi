import { Server, Socket } from "socket.io";

interface UserSocket extends Socket {
  user: {
    id: number;
    username: string;
  };
}

export function registerGameSocket(io: Server, socket: UserSocket, onlineUsers: Record<number, any[]>) {
  socket.on("joinmatchup", (payload) => {
    console.log(`🎮 ${socket.user.username} wants to join a matchup`, payload);

    // Optional: send confirmation back to this user
    socket.emit("joinedMatchup", { status: "ok", user: socket.user.username });
  });
}
