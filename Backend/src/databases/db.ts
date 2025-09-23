import Fastify from "fastify";
import sqlite3 from "sqlite3";
import path from "path";

const fastify = Fastify({ logger: true });
const { Database } = sqlite3;

const dbPath = path.resolve(__dirname, "./mydatabase.sqlite");    
export const db = new Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to the SQLite database");
    }
});

export function createTable(){
    db.run(
        `CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            lastName TEXT NOT NULL,
            firstName TEXT NOT NULL,
            password TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            refreshToken TEXT
        )`,
        (err) => {
            if (err) {
                console.error("Error creating table:", err.message);
            } else {
                console.log('Table "players" created or already exists.');
            }
        }
    );
}


