import { Server } from "socket.io";
import { registerChatSocket } from "./chatSocket";
import { registerNotifSocket } from "./notifSocket";
import { registerGameSocket } from "./gameSocket";
import jwt from "jsonwebtoken";
import { db } from "../databases/db";

interface UserPayload {
  id: number;
  username: string;
}

const onlineUsers: Record<number, any[]> = {};

// Mock function to get friend IDs of a user
async function getFriendIds(userId: number): Promise<number[]> {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT 
        CASE 
          WHEN player_id = ? THEN friend_id
          ELSE player_id
        END as friend_id
      FROM friends
      WHERE (player_id = ? OR friend_id = ?) AND status = 'accepted';
      `,
      [userId, userId, userId],
      (err, rows: { friend_id: number }[]) => {
        if (err) reject(err);
        else resolve(rows.map(r => r.friend_id));
      }
    );
  });
}

export function registerSocketHandlers(io: Server) {
  io.use((socket: any, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN!) as UserPayload;
      socket.user = decoded;
      next();
    } catch (err) {
      console.error("❌ Invalid socket token:", err);
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket: any) => {
    const user = socket.user;
    socket.join(user.id.toString());

    if (!onlineUsers[user.id]) onlineUsers[user.id] = [];
    onlineUsers[user.id].push(socket);

    console.log(`🟢 ${user.username} connected. Total connections: ${onlineUsers[user.id].length}`);

    // Notify friends that this user is online
    const friendIds = await getFriendIds(user.id);
    friendIds.forEach(fid => {
      if (onlineUsers[fid]) {
        onlineUsers[fid].forEach(s => s.emit("friend-online", { id: user.id, username: user.username }));
      }
    });

    // Register other socket events
    registerChatSocket(io, socket, onlineUsers);
    registerNotifSocket(io, socket, onlineUsers);
    registerGameSocket(io, socket);

    socket.on("disconnect", async () => {
      onlineUsers[user.id] = onlineUsers[user.id].filter(s => s.id !== socket.id);
      if (onlineUsers[user.id].length === 0) {
        delete onlineUsers[user.id];

        // Notify friends that this user is offline
        const friendIds = await getFriendIds(user.id);
        friendIds.forEach(fid => {
          if (onlineUsers[fid]) {
            onlineUsers[fid].forEach(s => s.emit("friend-offline", { id: user.id }));
          }
        });
      }

      console.log(`🔴 ${user.username} disconnected. Remaining connections: ${onlineUsers[user.id]?.length || 0}`);
    });
  });
}
