import "fastify";
import { User } from "../interfaces/userInterface";

declare module "fastify" {
  interface FastifyRequest {
    user?: User;
  }
}
