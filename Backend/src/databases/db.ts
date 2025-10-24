import sqlite3 from "sqlite3";
import path from "path";

sqlite3.verbose();
const { Database } = sqlite3;

const dbPath = path.resolve(__dirname, "./mydatabase.sqlite");    
export const db = new Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to the SQLite database");
    }
});

export function createFriendsTable (){
    db.run(
        `CREATE TABLE IF NOT EXISTS friends (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL,
            friend_id INTEGER NOT NULL,
            status TEXT DEFAULT 'pending', -- pending | accepted | blocked | none
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
            FOREIGN KEY (friend_id) REFERENCES players(id) ON DELETE CASCADE,
            UNIQUE (player_id, friend_id)
        )`,
        (error) => {
            if (error)
                console.error("Error creating friends table : ", error.message);
            else
                console.log("Friends table created or already exists. ");
        }
    );
}

export function createUserInfo() {
    db.run(
        `CREATE TABLE IF NOT EXISTS player_infos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            desp TEXT NOT NULL,
            socials TEXT NULL,
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        )`,
        (err) => {
            if (err) {
                console.error("Error creating player_infos table:", err.message);
            } else {
                console.log('Table "player_infos" created or already exists.');
            }
        }
    );
}


export function createOTPTable() {
    db.run(
        `CREATE TABLE IF NOT EXISTS player_otps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL,
            otp_code TEXT NOT NULL,
            purpose TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            used INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        )`,
        (err) => {
            if (err) {
                console.error("Error creating OTP table:", err.message);
            } else {
                console.log('Table "player_otps" created or already exists.');
            }
        }
    );
}

export function createTable(){
    db.run(
        `CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            lastName TEXT NOT NULL,
            firstName TEXT NOT NULL,
            password TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            is_verified INTEGER DEFAULT 0,
            avatar TEXT NULL,
            refreshToken TEXT,
            auth_Provider TEXT DEFAULT 'local'
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

export function createsDbTabes(){
    createTable();
    createOTPTable();
    createUserInfo();
    createFriendsTable();
}
