import { Server as IOServer } from "socket.io";
import { registerChatSocket } from "./chatSocket";
import jwt from "jsonwebtoken";
// import { registerGameSocket } from "./gameSocket";
// import { registerNotifSocket } from "./notifSocket";

export function registerSocketHandlers(io: IOServer) {
    io.use((socket : any, next : any) => {
        try {
        const cookieHeader = socket.request.headers.cookie;
          if (!cookieHeader) return next(new Error("Missing auth cookieHeader"));
    
          const decoded = jwt.verify(cookieHeader, process.env.REFRESH_TOKEN!);
          (socket as any).user = decoded;
          next();
        } catch (err : any) {
          console.error("❌ Invalid socket token:", err);
          next(new Error("Unauthorized"));
        }
      });
    
      io.on("connection", (socket: any) => {
        const user = (socket as any).user;
        console.log(`🟢 ${user.username} connected via socket`);
    
        socket.on("message", (data : any) => {
          console.log("💬 Message from", user.username, data);
        });
      });
    io.on("connection", (socket : any) => {
    console.log("🟢 Client connected:", socket.id);
    registerChatSocket(io, socket);
    socket.on("disconnect", () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });
}
