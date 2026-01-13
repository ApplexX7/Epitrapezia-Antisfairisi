import { Server as IOServer } from "socket.io";
import { FastifyInstance } from "fastify";

export class SocketManager {
  private io: IOServer;

  constructor(server: FastifyInstance) {
    this.io = new IOServer(server.server, {
      cors: { origin: "*", methods: ["GET", "POST"] },
    });

    this.io.on("connection", (socket : any) => {

      socket.on("message", (data : any) => {
        this.io.emit("message", data);
      });

      socket.on("disconnect", () => {
      });
    });
  }

  disconnectAll() {
    this.io.sockets.sockets.forEach((socket : any) => socket.disconnect(true));
  }
}
