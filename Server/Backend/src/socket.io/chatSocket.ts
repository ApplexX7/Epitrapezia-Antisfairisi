import { Server as IOServer, Socket } from "socket.io";

export function registerChatSocket(io: IOServer, socket: Socket) {
  socket.on("chat:message", (data : any) => {
    console.log(`💬 Message from ${socket.id}:`, data);
    io.emit("chat:message", { ...data, time: new Date() });
  });

  socket.on("chat:typing", (username : string) => {
    socket.broadcast.emit("chat:typing", username);
  });
}
