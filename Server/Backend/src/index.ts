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

createsDbTabes();

// After createsDbTabes();
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='message'", (err, row) => {
  if (err) {
    console.error("❌ Error checking message table:", err);
  } else if (row) {
    console.log("✅ Message table exists");
    
    // Check table structure
    db.all("PRAGMA table_info(message)", (err, columns) => {
      if (err) {
        console.error("❌ Error getting table info:", err);
      } else {
        console.log("📋 Message table structure:", columns);
      }
    });
  } else {
    console.log("❌ Message table does NOT exist!");
  }
});
const app = Server.instance();


app.register(fastifyCors, {
  origin: ["https://localhost", "https://WebPong.1337.ma"], // your frontend URLs
  credentials: true, // allow cookies
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
    (req as any).user = await verifyRefreshToken(refreshToken);
  } catch (err) {
    return reply.code(401).send({ message: "Invalid or expired refresh token" });
  }
});

async function bootstrap() {
  await authRouters();
  await Server.start();
}

bootstrap();
// In index.ts after bootstrap()
// app.get("/test-db", async (req, reply) => {
//   try {
//     // Test insert
//     const testId = await saveMessage(1, 2, "Test message");
//     console.log("Test message inserted with ID:", testId);
    
//     // Test select
//     const messages = await getMessages(1, 2);
//     console.log("Test messages retrieved:", messages);
    
//     return { success: true, testId, messages };
//   } catch (error: any) {
//     console.error("Test failed:", error);
//     return { success: false, error: error.message };
//   }
// });
friends();
playerSettings();
Message();

app.ready((err) => {
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

