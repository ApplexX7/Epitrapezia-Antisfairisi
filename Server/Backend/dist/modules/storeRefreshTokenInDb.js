"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeRefrechTokenInDb = storeRefrechTokenInDb;
const db_1 = require("../databases/db");
async function storeRefrechTokenInDb(refreshToken, user) {
    return await new Promise((resolve, reject) => {
        db_1.db.run("UPDATE players SET refreshToken = ? WHERE id = ?", [refreshToken, user.id], function (err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
