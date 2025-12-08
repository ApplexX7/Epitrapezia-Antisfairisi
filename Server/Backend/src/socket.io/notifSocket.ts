// notifSocket.ts
import { Server, Socket } from "socket.io";

interface OnlineUsers {
  [key: number]: Socket[];
}

export function registerNotifSocket(
  io: Server,
  socket: Socket,
  onlineUsers: OnlineUsers
) {
  const user = (socket as any).user;

  socket.on("send-notification", (data: any) => {
    const { to, type, message } = data;

    if (onlineUsers[to]) {
      for (const s of onlineUsers[to]) {
        s.emit("notification", {
          type,
          message,
          from: { id: user.id, username: user.username },
          time: new Date().toISOString(),
        });
      }
    }
  });
}
