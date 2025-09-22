import fastify, { FastifyInstance, RouteHandlerMethod } from "fastify";

export class Server {
  private static readonly port = 8080;
  private static readonly host = "0.0.0.0";
  private static readonly serv: FastifyInstance = fastify({ logger: true });

  public static async start() {
    try {
      await this.serv.listen({ port: this.port, host: this.host });
      console.log(`🚀 Server listening at http://${this.host}:${this.port}`);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }

  public static route(
    method: "get" | "post" | "put" | "delete" | "patch",
    path: string,
    handler: RouteHandlerMethod<any, any, any>
  ) {
    this.serv[method](path, handler as any);
  }

  public static instance() {
    return this.serv;
  }
}
