import fastify, { FastifyInstance } from "fastify";
import { Server } from "./server";
import {createTable, db} from './databases/db'
import { authRouters } from "./routers/auth";
import fastifyCors from '@fastify/cors';


createTable();
authRouters();


Server.instance().register(fastifyCors, {
  origin: 'http://localhost:3000', 
  credentials: true,
});

Server.instance().get("/", async (req, reply) => {
    return "hello";
  });

Server.start()

process.on("exit", () => db.close());
process.on("SIGINT", () => db.close(() => process.exit(0)));