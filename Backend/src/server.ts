import fastify, { FastifyInstance , RouteHandlerMethod} from "fastify";

export class Server {
  private static readonly port = 8080;
  private static readonly host = "0.0.0.0";
  private static readonly serv: FastifyInstance = fastify({ logger: true });

  public static async start() {
    try {
      const address = await this.serv.listen({
        port: this.port,
        host: this.host,
      });
      console.log(`🚀 Server listening at ${address}`);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }

  public static route<
    T extends "get" | "post" | "put" | "delete" | "patch"
  >(
    method: T,
    path: string,
    handler: Parameters<FastifyInstance[T]>[1]
  ) {
    this.serv[method](path, handler as RouteHandlerMethod);
  }

  public static instance() {
    return this.serv;
  }
}