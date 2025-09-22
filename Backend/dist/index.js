"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const db_1 = require("./db");
const auth_1 = require("./controllers/auth");
const db = (0, db_1.createTable)();
server_1.Server.instance().post("/auth/login", async (req, reply) => {
    return (0, auth_1.Login)(req, reply);
});
server_1.Server.start();
