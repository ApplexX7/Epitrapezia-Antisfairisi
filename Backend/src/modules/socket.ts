import { Server as IOServer } from "socket.io";
import { FastifyInstance } from "fastify";

export class SocketManager {
  private io: IOServer;

  constructor(server: FastifyInstance) {
    this.io = new IOServer(server.server, {
      cors: { origin: "*", methods: ["GET", "POST"] },
    });

    this.io.on("connection", (socket) => {
      console.log("🟢 A user connected:", socket.id);

      socket.on("message", (data) => {
        console.log("📩 Message received:", data);
        this.io.emit("message", data);
      });

      socket.on("disconnect", () => {
        console.log("🔴 User disconnected:", socket.id);
      });
    });
  }

  disconnectAll() {
    this.io.sockets.sockets.forEach((socket) => socket.disconnect(true));
  }
}
