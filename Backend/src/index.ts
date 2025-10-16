import { Server } from "./server";
import {createsDbTabes,db} from './databases/db'
import { authRouters } from "./routers/auth";
import fastifyCors from '@fastify/cors';
import { FastifyReply, FastifyRequest } from "fastify";
import { refreshTokenDate } from "./controllers/authRefresh";



createsDbTabes();
authRouters();

Server.instance().register(fastifyCors, {
  origin: true,
  credentials: true,
});


Server.instance().addHook("onRequest", async (req: FastifyRequest, reply: FastifyReply) => {
  const routeUrl = req.routeOptions.url;

  if (routeUrl === "/auth/Login" || routeUrl === "/auth/Sign-up" ||
      routeUrl === "/auth/google" || routeUrl === "/auth/google/callback" ||
      routeUrl == "/auth/verify-otp" || routeUrl === "/auth/resend-otp"
  ) {
    return;
  }

  const refreshToken =
    req.cookies?.refreshToken || (req.headers["x-refresh-token"] as string | undefined);

  if (!refreshToken) {
    reply.code(400).send({ message: "Missing refresh token" });
    return;
  }

  try {
    const decoded = refreshTokenDate(refreshToken);
    if (!decoded) {
      throw new Error("Invalid refresh token");
    }
    (req as any).user = decoded;

  } catch (err) {
    reply.code(401).send({ message: "Invalid or expired refresh token" });
  }
});


Server.instance().get("/", async (req, reply) => {
    return "hello";
  });

Server.start()

process.on("exit", () => db.close());
process.on("SIGINT", () => db.close(() => process.exit(0)));