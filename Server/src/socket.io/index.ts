import { Server } from "socket.io";
import { registerChatSocket } from "./chatSocket";
import { registerNotifSocket } from "./notifSocket";
import { registerGameSocket } from "./gameSocket";
import { registerTicTacToeSocket } from "./tictactoeSocket";
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
      WHERE (player_id = ? OR friend_id = ?) 
        AND status = 'accepted'
        AND friend_id NOT IN (
          SELECT blocked_id FROM block WHERE blocker_id = ?
        )
        AND friend_id NOT IN (
          SELECT blocker_id FROM block WHERE blocked_id = ?
        );
      `,
      [userId, userId, userId, userId, userId],
      (err, rows: { friend_id: number }[]) => {
        if (err) reject(err);
        else resolve(rows.map(r => r.friend_id));
      }
    );
  });
}

// Function to get user data with avatar
async function getUserWithAvatar(userId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id, username, avatar FROM players WHERE id = ?`,
      [userId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
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
    const isFirstConnection = onlineUsers[user.id].length === 0;
    onlineUsers[user.id].push(socket);

    // Update is_online status when first connection
    if (isFirstConnection) {
      db.run(
        `UPDATE players SET is_online = 1 WHERE id = ?`,
        [user.id],
        (err) => {
          if (err) console.error("Error updating is_online status:", err);
        }
      );
    }

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
          
          // Log XP to history table
          db.run(
            `INSERT INTO xp_history (player_id, date, xp_gained, source) 
             VALUES (?, ?, ?, 'session_time')
             ON CONFLICT(player_id, date, source) 
             DO UPDATE SET xp_gained = xp_gained + ?`,
            [user.id, today, xpGained, xpGained],
            (err) => {
              if (err) console.error("Error logging XP history:", err);
            }
          );
        }
      }
    }, 300000);

    console.log(`🟢 ${user.username} connected. Total connections: ${onlineUsers[user.id].length}`);

    // Get all accepted friends for this user
    const friendIds = await getFriendIds(user.id);
    
    // Send current online friends to the newly connected user
    const onlineFriends: any[] = [];
    for (const friendId of friendIds) {
      if (onlineUsers[friendId]) {
        // Fetch friend user data with avatar
        const friendData = await getUserWithAvatar(friendId);
        if (friendData) {
          onlineFriends.push(friendData);
        }
      }
    }
    socket.emit("users-list", onlineFriends);

    // Notify friends that this user is online and send updated users-list
    friendIds.forEach(async (fid) => {
      if (onlineUsers[fid]) {
        // Get the newly online user's data with avatar
        const newUserData = await getUserWithAvatar(user.id);
        onlineUsers[fid].forEach(s => {
          s.emit("friend-online", { id: user.id, username: user.username });
          // Also send the updated users-list
          const updatedList = onlineFriends.concat(newUserData);
          s.emit("users-list", updatedList);
        });
      }
    });

    // Register other socket events
    registerChatSocket(io, socket, onlineUsers);
    registerNotifSocket(io, socket, onlineUsers);
    registerGameSocket(io, socket);
    registerTicTacToeSocket(io, socket);

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
          
          // Log XP to history table
          db.run(
            `INSERT INTO xp_history (player_id, date, xp_gained, source) 
             VALUES (?, ?, ?, 'session_disconnect')
             ON CONFLICT(player_id, date, source) 
             DO UPDATE SET xp_gained = xp_gained + ?`,
            [user.id, today, xpGained, xpGained],
            (err) => {
              if (err) console.error("Error logging XP history:", err);
            }
          );
        }
      }

      onlineUsers[user.id] = onlineUsers[user.id].filter(s => s.id !== socket.id);
      if (onlineUsers[user.id].length === 0) {
        delete onlineUsers[user.id];

        // Update is_online status when last connection closes
        db.run(
          `UPDATE players SET is_online = 0 WHERE id = ?`,
          [user.id],
          (err) => {
            if (err) console.error("Error updating is_online status:", err);
          }
        );

        // Notify friends that this user is offline
        const friendIds = await getFriendIds(user.id);
        friendIds.forEach(async (fid) => {
          if (onlineUsers[fid]) {
            // Get updated list of online friends for this friend (excluding the user who just disconnected)
            const updatedFriendsList: any[] = [];
            const friendOfFriendIds = await getFriendIds(fid);
            for (const friendOfFriendId of friendOfFriendIds) {
              if (onlineUsers[friendOfFriendId] && friendOfFriendId !== user.id) {
                const friendData = await getUserWithAvatar(friendOfFriendId);
                if (friendData) {
                  updatedFriendsList.push(friendData);
                }
              }
            }
            
            onlineUsers[fid].forEach(s => {
              s.emit("friend-offline", { id: user.id });
              // Send updated users-list without the offline user
              s.emit("users-list", updatedFriendsList);
            });
          }
        });
      }

      console.log(`🔴 ${user.username} disconnected. Remaining connections: ${onlineUsers[user.id]?.length || 0}`);
    });
  });
}
