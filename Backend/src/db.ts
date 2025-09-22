import Fastify from "fastify";
import sqlite3 from "sqlite3";

const fastify = Fastify({ logger: true });
const { Database } = sqlite3;


export function createTable(){
    const db = new Database("./databases/mydatabase.db", (err) => {
        if (err) {
            console.error("Error opening database:", err.message);
        } else {
            console.log("Connected to the SQLite database");
        }
    });
    
    db.run(
        `CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            lastName TEXT NOT NULL,
            firstName TEXT NOT NULL,
            password TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL
        )`,
        (err) => {
            if (err) {
                console.error("Error creating table:", err.message);
            } else {
                console.log('Table "players" created or already exists.');
            }
        }
    );
    return (db);
}


