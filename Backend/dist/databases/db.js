"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.createFriendsTable = createFriendsTable;
exports.createUserInfo = createUserInfo;
exports.createOTPTable = createOTPTable;
exports.createTable = createTable;
exports.createsDbTabes = createsDbTabes;
const fastify_1 = __importDefault(require("fastify"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const fastify = (0, fastify_1.default)({ logger: true });
const { Database } = sqlite3_1.default;
const dbPath = path_1.default.resolve(__dirname, "./mydatabase.sqlite");
exports.db = new Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    }
    else {
        console.log("Connected to the SQLite database");
    }
});
function createFriendsTable() {
    exports.db.run(`CREATE TABLE IF NOT EXISTS friends (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL,
            friend_id INTEGER NOT NULL,
            status TEXT DEFAULT 'pending', -- pending | accepted | blocked | none
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
            FOREIGN KEY (friend_id) REFERENCES players(id) ON DELETE CASCADE,
            UNIQUE (player_id, friend_id)
        )`, (error) => {
        if (error)
            console.error("Error creating friends table : ", error.message);
        else
            console.log("Friends table created or already exists. ");
    });
}
function createUserInfo() {
    exports.db.run(`CREATE TABLE IF NOT EXISTS player_infos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            desp TEXT NOT NULL,
            socials TEXT NULL,
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        )`, (err) => {
        if (err) {
            console.error("Error creating player_infos table:", err.message);
        }
        else {
            console.log('Table "player_infos" created or already exists.');
        }
    });
}
function createOTPTable() {
    exports.db.run(`CREATE TABLE IF NOT EXISTS player_otps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL,
            otp_code TEXT NOT NULL,
            purpose TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            used INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        )`, (err) => {
        if (err) {
            console.error("Error creating OTP table:", err.message);
        }
        else {
            console.log('Table "player_otps" created or already exists.');
        }
    });
}
function createTable() {
    exports.db.run(`CREATE TABLE IF NOT EXISTS players (
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
        )`, (err) => {
        if (err) {
            console.error("Error creating table:", err.message);
        }
        else {
            console.log('Table "players" created or already exists.');
        }
    });
}
function createsDbTabes() {
    createTable();
    createOTPTable();
    createUserInfo();
    createFriendsTable();
}
