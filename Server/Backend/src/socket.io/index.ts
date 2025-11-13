import { Server } from "socket.io";
import { registerChatSocket } from "./chatSocket";
import { registerNotifSocket } from "./notifSocket";
import jwt from "jsonwebtoken";

interface UserPayload {
  id: number;
  username: string;
}

const onlineUsers: Record<number, any[]> = {};

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

  io.on("connection", (socket: any) => {
    const user = socket.user;

    socket.join(user.id.toString());
  
    if (!onlineUsers[user.id]) onlineUsers[user.id] = [];
    onlineUsers[user.id].push(socket);
  
    console.log(`🟢 ${user.username} connected. Total connections: ${onlineUsers[user.id].length}`);

    const usersList = Object.keys(onlineUsers).map(id => ({
      id: Number(id),
      username: onlineUsers[Number(id)][0].user.username,
    }));
    io.emit("users-list", usersList);
  
    registerChatSocket(io, socket, onlineUsers);
    registerNotifSocket(io, socket, onlineUsers);
  
    socket.on("disconnect", () => {
      onlineUsers[user.id] = onlineUsers[user.id].filter(s => s.id !== socket.id);
      if (onlineUsers[user.id].length === 0) delete onlineUsers[user.id];
  
      console.log(`🔴 ${user.username} disconnected. Remaining connections: ${onlineUsers[user.id]?.length || 0}`);
  
      const updatedUsers = Object.keys(onlineUsers).map(id => ({
        id: Number(id),
        username: onlineUsers[Number(id)][0].user.username,
      }));
      io.emit("users-list", updatedUsers);
    });
  });
}
