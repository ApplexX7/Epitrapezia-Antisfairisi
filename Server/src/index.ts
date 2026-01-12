import { Server } from "./server";
import { createsDbTabes, db } from "./databases/db";
import { authRouters } from "./routers/auth";
import fastifyCors from "@fastify/cors";
import { FastifyReply, FastifyRequest } from "fastify";
import { refreshTokenDate } from "./controllers/authRefresh";
import { playerSettings } from "./routers/player";
import { friends } from "./routers/friends";
import { verifyRefreshToken } from "./controllers/authRefresh";
import { Message } from "./routers/message";
import { seenMsg } from "./routers/seenMsg"
import { gameStatesRouters } from "./routers/gameStates";
import { attendanceRouters } from "./routers/attendance";
import { registerTournamentRoutes } from "./routers/tournament";
import client from "prom-client";

createsDbTabes();

const app = Server.instance();

// Extend FastifyRequest to include metricsStart
app.decorateRequest('metricsStart', null);


app.register(fastifyCors, {
  origin: ["https://e3r8p4.1337.ma"],
  credentials: true,
});


const registery = new client.Registry();
client.collectDefaultMetrics({ register: registery });

const httpRequetsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

const httpsRequestsDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 1.5, 2, 5],
});

registery.registerMetric(httpRequetsTotal);
registery.registerMetric(httpsRequestsDuration);

app.addHook("onRequest", async (req: any) => {
  req.metricsStart = process.hrtime();
});

app.addHook("onResponse", async (req: any, reply: FastifyReply) => {
  if (!req.metricsStart) return;
  
  const diff = process.hrtime(req.metricsStart);
  const duration = diff[0] + diff[1] / 1e9;

  const route = req.routeOptions?.url || req.url || "unknown";

  httpRequetsTotal.inc({
    method: req.method,
    route,
    status_code: reply.statusCode
  });

  httpsRequestsDuration.observe(
    { method: req.method, route, status_code: reply.statusCode },
    duration
  );
});

app.addHook("preHandler", async (req: FastifyRequest, reply: FastifyReply) => {
  const routeUrl = req.url;

  const publicRoutes = [
    "/auth/Login",
    "/auth/Sign-up",
    "/auth/refresh",
    "/auth/google",
    "/auth/google/callback",
    "/auth/verify-otp",
    "/auth/resend-otp",
    "/auth/verify-login-otp",
    "/auth/resend-login-otp",
    "/tournaments",
     "/metrics",
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
    const decoded = await refreshTokenDate(refreshToken);
    if (!decoded) throw new Error("Invalid refresh token");
    (req as any).user = await verifyRefreshToken(refreshToken);
  } catch (err) {
    return reply.code(401).send({ message: "Invalid or expired refresh token" });
  }
});

app.get("/metrics", async (req : FastifyRequest, reply : FastifyReply) => {
  reply.header("Content-Type", registery.contentType);
  return registery.metrics();
});


async function bootstrap() {
  await authRouters();
  registerTournamentRoutes();
  await Server.start();
}

bootstrap();
friends();
playerSettings();
Message();
seenMsg();
gameStatesRouters();
attendanceRouters();

app.ready((err : Error | null) => {
  if (err) throw err;
  console.log(app.printRoutes());
});

app.get("/", async () => "hello");



process.on("SIGINT", () => {
  console.log("Closing database...");
  db.close(() => {
    console.log("Database closed");
    process.exit(0);
  });
});

