import fastify, { FastifyInstance, RouteHandlerMethod } from "fastify";
import { Server as IOServer } from "socket.io";

export class Server {
  private static readonly port = 8080;
  private static readonly host = "0.0.0.0";
  private static readonly serv: FastifyInstance = fastify({ logger: true });
  private static io: IOServer;
  private static connected_client: Map<string, string> = new Map();

  public static async start() {
    try {
      await this.serv.listen({ port: this.port, host: this.host });
      console.log(`🚀 Hello! Server running on http://${this.host}:${this.port}`);

      this.io = new IOServer(this.serv.server, {
        cors: { origin: "*" },
      });

      this.io.on("connection", (socket) => {
        console.log("🟢 Client connected:", socket.id);

        const user_name: string = socket.handshake.query.username as string;
        if (user_name) {
          this.connected_client.set(user_name, socket.id);
          
          // Broadcast updated users list to ALL clients
          this.broadcastUsersList();
        }

        // Listen for messages
        socket.on("message", (data: { to: string; text: string }) => {
          const { to, text } = data;
          console.log(`📩 ${user_name} -> ${to}: ${text}`);

          // Get recipient socket id from the map
          const recipientSocketId = this.connected_client.get(to);

          if (recipientSocketId) {
            // Send message to recipient only
            this.io.to(recipientSocketId).emit("message", {
              from: user_name,
              text,
              time: new Date(),
            });
          }
        });

        socket.on("disconnect", () => {
          console.log("🔴 Client disconnected:", socket.id);
          // Remove user from map
          if (user_name) {
            this.connected_client.delete(user_name);
            // Broadcast updated users list to ALL remaining clients
            this.broadcastUsersList();
          }
        });
      });

      console.log("🔌 Socket.IO initialized");
    } catch (err) {
      console.error("❌ Server failed to start:", err);
      process.exit(1);
    }
  }

  // New method to broadcast online users
  private static broadcastUsersList() {
    const users = Array.from(this.connected_client.keys());
    console.log("👥 Broadcasting users list:", users);
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