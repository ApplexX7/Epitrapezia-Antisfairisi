import fastify, { FastifyInstance, RouteHandlerMethod } from "fastify";
import { Server as IOServer } from "socket.io";
import rateLimit from  '@fastify/rate-limit'

export class Server {
  private static readonly port = 8080;
  private static readonly host = "0.0.0.0";
  private static readonly serv: FastifyInstance = fastify({ logger: true });
  private static io: IOServer;
  private static connectedClients: Map<string, { socketId: string; username: string }> = new Map();

  public static async start() {
    try {
      await this.serv.register(rateLimit, {
        max: 100,
        timeWindow : "1 minute",
        ban : 2,
        allowList: ["127.0.0.1"],
        errorResponseBuilder : (req, context) => ({
          code : 429,
          error : "Too Many Requests",
          message : `Rate limit exceeeded, Try again in ${Math.ceil(context.ttl / 100)} seconds`,
        }),
      });
      await this.serv.listen({ port: this.port, host: this.host });
      console.log(`🚀 Hello! Server running on http://${this.host}:${this.port}`);

      this.io = new IOServer(this.serv.server, {
        cors: { origin: "*" },
        path: "/socket/",
      });

      this.io.on("connection", (socket) => {
        console.log("🟢 Client connected:", socket.id);

        const {id ,username} = socket.handshake.auth;
        if (id && username) {
          this.connectedClients.set(id, { socketId: socket.id, username: username });
          console.log(username),
          this.broadcastUsersList();
        }

        // Listen for messages
        socket.on("message", (data: { to: string; text: string }) => {
          const { to, text } = data;
          const receiver = this.connectedClients.get(to);
          if (receiver) {
            this.io.to(receiver.socketId).emit("message", {
              from: id,
              username: username,
              text,
              time: new Date(),
            });
          }
        });
        

        socket.on("disconnect", () => {
          console.log("🔴 Client disconnected:", socket.id);
          if (username) {
            this.connectedClients.delete(id);
            this.broadcastUsersList();
          }
        });
      });

    } catch (err) {
      console.error("❌ Server failed to start:", err);
      process.exit(1);
    }
  }


  private static  broadcastUsersList() {
    const users = Array.from(this.connectedClients.values()).map(u => u.username);
    this.io.emit("users-list", users);
    
  }

  public static route(
    method: "get" | "post" | "put" | "delete" | "patch",
    path: string,
    handler: RouteHandlerMethod
  ) {
    this.serv[method](path, handler as any);
  }

  public static instance(): FastifyInstance {
    return this.serv;
  }

  public static socket(): IOServer {
    if (!this.io)
      throw new Error("Socket.IO not initialized. Call start() first.");
    return this.io;
  }
}