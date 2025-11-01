"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTable = createTable;
const fastify_1 = __importDefault(require("fastify"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const fastify = (0, fastify_1.default)({ logger: true });
const { Database } = sqlite3_1.default;
function createTable() {
    const db = new Database("./databases/mydatabase.db", (err) => {
        if (err) {
            console.error("Error opening database:", err.message);
        }
        else {
            console.log("Connected to the SQLite database");
        }
    });
    db.run(`CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            lastName TEXT NOT NULL,
            firstName TEXT NOT NULL,
            password TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL
        )`, (err) => {
        if (err) {
            console.error("Error creating table:", err.message);
        }
        else {
            console.log('Table "players" created or already exists.');
        }
    });
    return (db);
}
