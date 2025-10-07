import { Server } from "./server";
import {createTable, createOTPTable ,db} from './databases/db'
import { authRouters } from "./routers/auth";
import fastifyCors from '@fastify/cors';


createTable();
createOTPTable();
authRouters();


Server.instance().register(fastifyCors, {
  origin: true,
  credentials: true,
});

Server.instance().get("/", async (req, reply) => {
    return "hello";
  });

Server.start()

process.on("exit", () => db.close());
process.on("SIGINT", () => db.close(() => process.exit(0)));