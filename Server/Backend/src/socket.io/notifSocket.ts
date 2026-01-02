// notifSocket.ts
import { Server, Socket } from "socket.io";
import { createRoomAndStartGame, UserSocket } from "./gameSocket";

type PendingInvite = {
  inviterSocketId: string;
  mode: string;
  createdAt: number;
};

// Keyed by `${inviterId}:${inviteeId}`
const pendingInvites = new Map<string, PendingInvite>();

function inviteKey(inviterId: number, inviteeId: number) {
  return `${inviterId}:${inviteeId}`;
}

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

    // Track which exact socket sent this invite so we can start the match
    // on the same tab/session that initiated it.
    try {
      pendingInvites.set(inviteKey(Number(user.id), Number(to)), {
        inviterSocketId: socket.id,
        mode,
        createdAt: Date.now(),
      });
    } catch {}

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
  socket.on("game:invite:response", async (data: any) => {
    const { to, status } = data || {};
    if (!to || !status) return;

    let roomId: string | undefined;
    if (status === "accepted" && onlineUsers[to] && onlineUsers[to].length > 0) {
      const key = inviteKey(Number(to), Number(user.id));
      const pending = pendingInvites.get(key);
      // prune stale invites (5 minutes)
      const isStale = pending ? Date.now() - pending.createdAt > 5 * 60 * 1000 : false;
      if (isStale) pendingInvites.delete(key);

      const inviterSockets = onlineUsers[to];
      const inviterSocketRaw =
        pending && !isStale
          ? inviterSockets.find((s) => s.id === pending.inviterSocketId)
          : undefined;

      const inviterSocket =
        (inviterSocketRaw || inviterSockets[0]) as unknown as UserSocket;
      const inviteeSocket = socket as unknown as UserSocket;
      try {
        const res = await createRoomAndStartGame(io, inviterSocket, inviteeSocket);
        roomId = res?.roomId;
      } catch (e) {
        console.error("Failed to start invite game", e);
      }

      // One response completes the invite lifecycle.
      pendingInvites.delete(key);
    }

    // If declined, clear any pending invite record.
    if (status !== "accepted") {
      pendingInvites.delete(inviteKey(Number(to), Number(user.id)));
    }

    if (onlineUsers[to]) {
      for (const s of onlineUsers[to]) {
        s.emit("notification", {
          type: "game-invite-response",
          message: `${user.username} ${status} your game invite`,
          from: { id: user.id, username: user.username },
          payload: { status, roomId },
          time: new Date().toISOString(),
        });
      }
    }
  });
}

