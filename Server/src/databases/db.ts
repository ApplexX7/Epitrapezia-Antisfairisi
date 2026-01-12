import sqlite3 from "sqlite3";
import path from "path";

sqlite3.verbose();
const { Database } = sqlite3;

// Use /data for Docker volume mount, fallback to local for development
const dbPath = process.env.DB_PATH || path.resolve(__dirname, "./webpong.sqlite");
export const db = new Database(dbPath, (err : any) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Database connected at:", dbPath);
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
        (error : any) => {
            if (error)
                console.error("Error creating friends table : ", error.message);
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
        (err : any) => {
            if (err) {
                console.error("Error creating player_infos table:", err.message);
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
        (err : any) => {
            if (err) {
                console.error("Error creating OTP table:", err.message);
            }
        }
    );
}

export function createGameStats() {
    db.run(
        `CREATE TABLE IF NOT EXISTS game_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL UNIQUE,
            total_games INTEGER DEFAULT 0,
            wins INTEGER DEFAULT 0,
            losses INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        )`,
        (err : any) => {
            if (err) {
                console.error("Error creating game_stats table:", err.message);
            }
        }
    );
}

export function createGameHistory() {
    db.run(
        `CREATE TABLE IF NOT EXISTS game_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            player1_id INTEGER NOT NULL,
            player2_id INTEGER NOT NULL,

            player1_score INTEGER NOT NULL DEFAULT 0,
            player2_score INTEGER NOT NULL DEFAULT 0,

            winner_id INTEGER NOT NULL, -- id of the player who won

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (player1_id) REFERENCES players(id) ON DELETE CASCADE,
            FOREIGN KEY (player2_id) REFERENCES players(id) ON DELETE CASCADE,
            FOREIGN KEY (winner_id) REFERENCES players(id) ON DELETE CASCADE
        )`,
        (err : any) => {
            if (err) {
                console.error("Error creating game_history table:", err.message);
            }
        }
    );
}

export function ensureGameStatsForPlayer(playerId: number): Promise<void> {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT OR IGNORE INTO game_stats (player_id, total_games, wins, losses) VALUES (?, 0, 0, 0)`,
            [playerId],
            (err : any) => {
                if (err) {
                    console.error(`Error ensuring game_stats for player ${playerId}:`, err.message);
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });
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
            is_online INTEGER DEFAULT 0,
            auth_Provider TEXT DEFAULT 'local',
            level INTEGER DEFAULT 1,
            experience INTEGER DEFAULT 0,
            two_factor_enabled INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (err : any) => {
            if (err) {
                console.error("Error creating table:", err.message);
            }
        }
    );
}

export function createTableMessage() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS message (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER,
            receiver_id INTEGER,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            readed INTEGER DEFAULT 0 CHECK (readed IN (0, 1)),
            seen BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (sender_id) REFERENCES players(id) ON DELETE CASCADE,
            FOREIGN KEY (receiver_id) REFERENCES players(id) ON DELETE CASCADE
        )
    `;

    db.run(createTableQuery, (err : any) => {
        if (err) {
            console.error("Error creating message table:", err.message);
        }
    });
}

export function createBlockTable() {
    const createTableBlock = `
        CREATE TABLE IF NOT EXISTS block (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            blocker_id INTEGER NOT NULL,
            blocked_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(blocker_id, blocked_id),
            FOREIGN KEY (blocker_id) REFERENCES players(id) ON DELETE CASCADE,
            FOREIGN KEY (blocked_id) REFERENCES players(id) ON DELETE CASCADE
        )
    `;
    db.run(createTableBlock, (err : any) => {
        if (err) console.error("Error creating block table:", err.message);
    });
}
export function createAttendanceTable() {
    db.run(
        `CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL,
            date DATE NOT NULL,
            hours REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
            UNIQUE(player_id, date)
        )`,
        (err : any) => {
            if (err) {
                console.error("Error creating attendance table:", err.message);
            }
        }
    );
}



export function createTournamentTable() {
    db.run(
        `CREATE TABLE IF NOT EXISTS tournaments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            creator_id INTEGER NOT NULL,
            password TEXT NOT NULL,
            status TEXT DEFAULT 'pending', -- pending | in_progress | completed
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (creator_id) REFERENCES players(id) ON DELETE CASCADE
        )`,
        (err : any) => {
            if (err) {
                console.error("Error creating tournaments table:", err.message);
            }
        }
    );
}

export function createTournamentPlayersTable() {
    db.run(
        `CREATE TABLE IF NOT EXISTS tournament_players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tournament_id INTEGER NOT NULL,
            player_id INTEGER NOT NULL,
            display_name TEXT NOT NULL,
            joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(tournament_id, player_id),
            FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        )`,
        (err : any) => {
            if (err) {
                console.error("Error creating tournament_players table:", err.message);
            }
        }
    );
}

export function createTournamentMatchesTable() {
    db.serialize(() => {
        db.run(
            `CREATE TABLE IF NOT EXISTS tournament_matches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tournament_id INTEGER NOT NULL,
                stage TEXT NOT NULL, -- semi | final | third
                match_number INTEGER NOT NULL,
                player_a_id INTEGER,
                player_b_id INTEGER,
                winner_id INTEGER,
                loser_id INTEGER,
                player_a_accepted INTEGER DEFAULT 0,
                player_b_accepted INTEGER DEFAULT 0,
                status TEXT DEFAULT 'idle', -- idle | in_progress | finished
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
                FOREIGN KEY (player_a_id) REFERENCES players(id) ON DELETE SET NULL,
                FOREIGN KEY (player_b_id) REFERENCES players(id) ON DELETE SET NULL,
                FOREIGN KEY (winner_id) REFERENCES players(id) ON DELETE SET NULL,
                FOREIGN KEY (loser_id) REFERENCES players(id) ON DELETE SET NULL
            )`,
            (err : any) => {
                if (err) {
                    console.error("Error creating tournament_matches table:", err.message);
                    return;
                }
            }
        );

        // Add columns if they don't exist (for existing databases)
        db.run(`ALTER TABLE tournament_matches ADD COLUMN player_a_accepted INTEGER DEFAULT 0`, (err: any) => {
            if (err && !err.message.includes('duplicate column')) {
                console.error("Error adding player_a_accepted column:", err.message);
            }
        });
        db.run(`ALTER TABLE tournament_matches ADD COLUMN player_b_accepted INTEGER DEFAULT 0`, (err: any) => {
            if (err && !err.message.includes('duplicate column')) {
                console.error("Error adding player_b_accepted column:", err.message);
            }
        });
    });
}

export function createTournamentResultsTable() {
    db.run(
        `CREATE TABLE IF NOT EXISTS tournament_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tournament_id INTEGER NOT NULL UNIQUE,
            first_place_id INTEGER,
            second_place_id INTEGER,
            third_place_id INTEGER,
            fourth_place_id INTEGER,
            completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE,
            FOREIGN KEY (first_place_id) REFERENCES players(id) ON DELETE SET NULL,
            FOREIGN KEY (second_place_id) REFERENCES players(id) ON DELETE SET NULL,
            FOREIGN KEY (third_place_id) REFERENCES players(id) ON DELETE SET NULL,
            FOREIGN KEY (fourth_place_id) REFERENCES players(id) ON DELETE SET NULL
        )`,
        (err : any) => {
            if (err) {
                console.error("Error creating tournament_results table:", err.message);
            }
        }
    );
}

export function createXpHistoryTable() {
    db.run(
        `CREATE TABLE IF NOT EXISTS xp_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL,
            date DATE NOT NULL,
            xp_gained INTEGER NOT NULL DEFAULT 0,
            source TEXT DEFAULT 'attendance',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
            UNIQUE(player_id, date, source)
        )`,
        (err : any) => {
            if (err) {
                console.error("Error creating xp_history table:", err.message);
            }
        }
    );
}

// TicTacToe specific tables
export function createTicTacToeStats() {
    db.run(
        `CREATE TABLE IF NOT EXISTS tictactoe_stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER NOT NULL UNIQUE,
            total_games INTEGER DEFAULT 0,
            wins INTEGER DEFAULT 0,
            losses INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        )`,
        (err : any) => {
            if (err) {
                console.error("Error creating tictactoe_stats table:", err.message);
            } else {
                console.log('Table "tictactoe_stats" created or already exists.');
            }
        }
    );
}

export function createTicTacToeHistory() {
    db.run(
        `CREATE TABLE IF NOT EXISTS tictactoe_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player1_id INTEGER NOT NULL,
            player2_id INTEGER NOT NULL,
            player1_score INTEGER NOT NULL DEFAULT 0,
            player2_score INTEGER NOT NULL DEFAULT 0,
            winner_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (player1_id) REFERENCES players(id) ON DELETE CASCADE,
            FOREIGN KEY (player2_id) REFERENCES players(id) ON DELETE CASCADE,
            FOREIGN KEY (winner_id) REFERENCES players(id) ON DELETE CASCADE
        )`,
        (err : any) => {
            if (err) {
                console.error("Error creating tictactoe_history table:", err.message);
            } else {
                console.log('Table "tictactoe_history" created or already exists.');
            }
        }
    );
}

export function ensureTicTacToeStatsForPlayer(playerId: number): Promise<void> {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT OR IGNORE INTO tictactoe_stats (player_id, total_games, wins, losses) VALUES (?, 0, 0, 0)`,
            [playerId],
            (err : any) => {
                if (err) {
                    console.error(`Error ensuring tictactoe_stats for player ${playerId}:`, err.message);
                    reject(err);
                } else {
                    resolve();
                }
            }
        );
    });
}

export function createsDbTabes(){
    createTable();
    createOTPTable();
    createUserInfo();
    createFriendsTable();
    createTableMessage();
    createGameStats();
    createGameHistory();
    createBlockTable();
    createAttendanceTable();
    createXpHistoryTable();
    createTournamentTable();
    createTournamentPlayersTable();
    createTournamentMatchesTable();
    createTournamentResultsTable();
    createTicTacToeStats();
    createTicTacToeHistory();
    createAttendanceTable();
}
