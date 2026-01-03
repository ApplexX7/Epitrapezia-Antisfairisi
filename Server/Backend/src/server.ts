import fastify, { FastifyInstance, RouteHandlerMethod } from "fastify";
import { Server as IOServer, Socket } from "socket.io";
import { registerSocketHandlers } from "./socket.io";
import rateLimit from  '@fastify/rate-limit';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';

export class Server {
  private static readonly port = 8080;
  private static readonly host = "0.0.0.0";
  private static readonly serv: FastifyInstance = fastify({ logger: true });
  private static io: IOServer;
  private static connectedClients: Map<string, { socketId: string; username: string }> = new Map();

  public static async start() {
    try {
      await this.serv.register(fastifyMultipart, {
        limits: {
          fileSize: 5 * 1024 * 1024, // 5MB limit
        },
      });

      // Serve static files from uploads directory
      await this.serv.register(fastifyStatic, {
        root: path.join(__dirname, 'uploads'),
        prefix: '/uploads/',
      });
      
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

      registerSocketHandlers(this.io);
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