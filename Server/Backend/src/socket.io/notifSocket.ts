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

  // Direct game invite to another player
  socket.on("game:invite", (data: any, callback?: Function) => {
    const { to, mode = "friendly" } = data || {};
    if (!to) {
      if (callback) callback({ ok: false, error: "Missing recipient" });
      return;
    }

    if (onlineUsers[to]) {
      for (const s of onlineUsers[to]) {
        s.emit("notification", {
          type: "game-invite",
          message: `${user.username} invited you to play a ${mode} match`,
          from: { id: user.id, username: user.username },
          payload: { mode },
          time: new Date().toISOString(),
        });
      }
      if (callback) callback({ ok: true });
    } else {
      if (callback) callback({ ok: false, error: "User offline" });
    }
  });

  // Response to a game invite (accept/decline)
  socket.on("game:invite:response", (data: any) => {
    const { to, status } = data || {};
    if (!to || !status) return;

    if (onlineUsers[to]) {
      for (const s of onlineUsers[to]) {
        s.emit("notification", {
          type: "game-invite-response",
          message: `${user.username} ${status} your game invite`,
          from: { id: user.id, username: user.username },
          payload: { status },
          time: new Date().toISOString(),
        });
      }
    }
  });
}
