"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptedFriends = acceptedFriends;
const db_1 = require("../databases/db");
async function acceptedFriends(user) {
    const sql = `SELECT p.*
        FROM friends f
        JOIN players p ON 
          (p.id = f.friend_id AND f.player_id = ?) OR
          (p.id = f.player_id AND f.friend_id = ?)
        WHERE f.status = 'accepted'
      `;
    return await new Promise((resolve, rejects) => {
        db_1.db.all(sql, [user.id, user.id], (err, friendsList) => {
            if (err)
                rejects(err);
            else
                resolve(friendsList);
        });
    });
}
