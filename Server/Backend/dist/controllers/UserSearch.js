"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSearch = UserSearch;
const db_1 = require("../databases/db");
function UserSearch() {
    return async (req, reply) => {
        const { query } = req.query;
        if (!query || query.trim() === "")
            return reply.code(400).send({ error: "Missing search query" });
        const user = req.user;
        if (!user)
            return reply.code(401).send({ message: "Not authenticated" });
        try {
            const result = await new Promise((resolve, reject) => {
                db_1.db.all("SELECT * FROM players WHERE username LIKE ? OR firstname LIKE ?", [`%${query}%`, `%${query}%`], (err, list) => {
                    if (err) {
                        reject(err);
                    }
                    else
                        resolve(list);
                });
            });
            const friends = await new Promise((resolve, reject) => {
                db_1.db.all("SELECT friend_id, status FROM friends WHERE player_id = ?", [user.id], (err, friends) => {
                    if (err)
                        reject(err);
                    else
                        resolve(friends);
                });
            });
            const filtered = result
                .filter(u => u.id !== user.id)
                .map(u => {
                const f = friends.find(f => f.friend_id === u.id);
                return {
                    id: u.id,
                    username: u.username,
                    firstname: u.firstname,
                    avatar: u.avatar,
                    friendstatus: f?.status ?? "none",
                };
            });
            console.log(filtered);
            return reply.send({
                result: filtered,
            });
        }
        catch (err) {
            return reply.code(500).send({ error: "Database error" });
        }
    };
}
