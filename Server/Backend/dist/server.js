"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const fastify_1 = __importDefault(require("fastify"));
class Server {
    static async start() {
        try {
            await this.serv.listen({ port: this.port, host: this.host });
            console.log(`🚀 Server listening at http://${this.host}:${this.port}`);
        }
        catch (err) {
            console.error(err);
            process.exit(1);
        }
    }
    static route(method, path, handler) {
        this.serv[method](path, handler);
    }
    static instance() {
        return this.serv;
    }
}
exports.Server = Server;
Server.port = 8080;
Server.host = "0.0.0.0";
Server.serv = (0, fastify_1.default)({ logger: true });
