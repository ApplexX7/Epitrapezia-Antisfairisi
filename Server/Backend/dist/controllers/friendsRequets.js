"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequest = FriendRequest;
exports.RemoveFriendRequest = RemoveFriendRequest;
const db_1 = require("../databases/db");
async function FriendRequest(req, reply) {
    console.log(req);
    const { id } = req.user;
    const { friendId } = req.body;
    if (!id)
        return reply.code(400).send({ message: "Not Authorized" });
    if (!friendId)
        return reply.code(400).send({ message: " Cant not invite yourself " });
    try {
        const existing = await new Promise((resolve, reject) => {
            db_1.db.all(`SELECT * FROM friends
               WHERE (player_id = ? AND friend_id = ?)
               OR (player_id = ? AND friend_id = ?)`, [id, friendId, friendId, id], (err, data) => (err ? reject(err) : resolve(data)));
        });
        if (existing.length > 0)
            return reply.code(400).send({ message: "Request already  send" });
        await new Promise((resolve, reject) => {
            db_1.db.run(`INSERT INTO friends (player_id, friend_id, status)
                VALUES (?, ?, 'pending')`, [id, friendId], (err) => { err ? reject(err) : resolve(); });
        });
        return reply.send({ success: true, message: "Friend request sent" });
    }
    catch (err) {
        console.log(err);
        return reply.code(500).send({ message: "Database error" });
    }
}
async function RemoveFriendRequest(req, reply) {
    const { id } = req.user;
}
