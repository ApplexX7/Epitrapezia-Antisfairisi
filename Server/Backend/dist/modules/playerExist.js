"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerExist = playerExist;
const db_1 = require("../databases/db");
async function playerExist(email, username) {
    return new Promise((resolve, reject) => {
        db_1.db.get("SELECT * FROM players WHERE username = ? OR email = ?", [username, email.toLowerCase()], (err, user) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(user);
            }
        });
    });
}
