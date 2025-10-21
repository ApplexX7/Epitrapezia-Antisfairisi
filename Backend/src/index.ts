import { Server } from "./server";
import { createsDbTabes, db } from "./databases/db";
import { authRouters } from "./routers/auth";
import fastifyCors from "@fastify/cors";
import { FastifyReply, FastifyRequest } from "fastify";
import { refreshTokenDate } from "./controllers/authRefresh";
import { playerSettings } from "./routers/player";

createsDbTabes();

const app = Server.instance();

app.register(fastifyCors, {
  origin: true,
  credentials: true,
});

app.addHook("onRequest", async (req: FastifyRequest, reply: FastifyReply) => {
  const routeUrl = req.url;

  const publicRoutes = [
    "/auth/Login",
    "/auth/Sign-up",
    "/auth/google",
    "/auth/google/callback",
    "/auth/verify-otp",
    "/auth/resend-otp",
  ];

  if (publicRoutes.some((r) => routeUrl.startsWith(r))) {
    return;
  }

  const refreshToken =
    req.cookies?.refreshToken ||
    (req.headers["x-refresh-token"] as string | undefined);

  if (!refreshToken) {
    return reply.code(401).send({ message: "Missing refresh token" });
  }

  try {
    const decoded = refreshTokenDate(refreshToken);
    if (!decoded) throw new Error("Invalid refresh token");

    (req as any).user = decoded;
  } catch (err) {
    return reply.code(401).send({ message: "Invalid or expired refresh token" });
  }
});

authRouters();
playerSettings();

app.ready((err) => {
  if (err) throw err;
  console.log(app.printRoutes());
});

app.get("/", async () => "hello");

Server.start();

process.on("exit", () => db.close());
process.on("SIGINT", () => db.close(() => process.exit(0)));
