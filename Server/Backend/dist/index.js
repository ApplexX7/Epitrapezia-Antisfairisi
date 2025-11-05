"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const db_1 = require("./databases/db");
const auth_1 = require("./routers/auth");
const cors_1 = __importDefault(require("@fastify/cors"));
const authRefresh_1 = require("./controllers/authRefresh");
const player_1 = require("./routers/player");
const friends_1 = require("./routers/friends");
const authRefresh_2 = require("./controllers/authRefresh");
(0, db_1.createsDbTabes)();
const app = server_1.Server.instance();
app.register(cors_1.default, {
    origin: true,
    credentials: true,
});
app.addHook("onRequest", async (req, reply) => {
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
    const refreshToken = req.cookies?.refreshToken ||
        req.headers["x-refresh-token"];
    if (!refreshToken) {
        return reply.code(401).send({ message: "Missing refresh token" });
    }
    try {
        const decoded = (0, authRefresh_1.refreshTokenDate)(refreshToken);
        if (!decoded)
            throw new Error("Invalid refresh token");
        req.user = await (0, authRefresh_2.verifyRefreshToken)(refreshToken);
    }
    catch (err) {
        return reply.code(401).send({ message: "Invalid or expired refresh token" });
    }
});
(0, auth_1.authRouters)();
(0, friends_1.friends)();
(0, player_1.playerSettings)();
app.ready((err) => {
    if (err)
        throw err;
    console.log(app.printRoutes());
});
app.get("/", async () => "hello");
server_1.Server.start();
process.on("exit", () => db_1.db.close());
process.on("SIGINT", () => db_1.db.close(() => process.exit(0)));
