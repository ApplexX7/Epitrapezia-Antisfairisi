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

    // Track connection start time for attendance
    socket.connectStartTime = Date.now();

    // Periodic update of attendance every 5 minutes while connected
    socket.updateInterval = setInterval(() => {
      if (socket.connectStartTime) {
        const sessionDurationMs = Date.now() - socket.connectStartTime;
        const sessionDurationHours = sessionDurationMs / (1000 * 60 * 60);

        const today = new Date().toISOString().split('T')[0];
        // Update attendance with current session time
        db.run(
          `INSERT INTO attendance (player_id, date, hours) VALUES (?, ?, ?) 
           ON CONFLICT(player_id, date) DO UPDATE SET hours = ?`,
          [user.id, today, sessionDurationHours, sessionDurationHours],
          (err) => {
            if (err) console.error("Error updating attendance:", err);
          }
        );

        // Add experience points (1.3 XP per hour for attendance)
        const xpGained = Math.floor(sessionDurationHours * 1.3);
        if (xpGained > 0) {
          db.run(
            `UPDATE players SET experience = experience + ? WHERE id = ?`,
            [xpGained, user.id],
            (err) => {
              if (err) console.error("Error updating experience:", err);
              else updateLevel(user.id);
            }
          );
        }
      }
    }, 300000);

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
      // Clear the update interval
      if (socket.updateInterval) {
        clearInterval(socket.updateInterval);
      }
      if (socket.connectStartTime) {
        const durationMs = Date.now() - socket.connectStartTime;
        const durationHours = durationMs / (1000 * 60 * 60);

        const today = new Date().toISOString().split('T')[0];
        // Update attendance hours
        db.run(
          `INSERT INTO attendance (player_id, date, hours) VALUES (?, ?, ?) 
           ON CONFLICT(player_id, date) DO UPDATE SET hours = hours + excluded.hours`,
          [user.id, today, durationHours],
          (err) => {
            if (err) console.error("Error updating attendance hours:", err);
          }
        );

        // Add experience points for the session (10 XP per hour)
        const xpGained = Math.floor(durationHours * 10);
        if (xpGained > 0) {
          db.run(
            `UPDATE players SET experience = experience + ? WHERE id = ?`,
            [xpGained, user.id],
            (err) => {
              if (err) console.error("Error updating experience:", err);
              else updateLevel(user.id);
            }
          );
        }
      }

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
