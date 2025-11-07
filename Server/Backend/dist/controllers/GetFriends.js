"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Getfriends = Getfriends;
const db_1 = require("../databases/db");
const friends_1 = require("../modules/friends");
function Getfriends() {
    return async (req, reply) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken)
                reply.code(401).send({ message: "Messing RefreshToken" });
            const user = await new Promise((resolve, rejects) => {
                db_1.db.get("SELECT * FROM WHERE players refreshToken = ?", [refreshToken], (err, user) => {
                    if (err)
                        rejects(err);
                    else {
                        resolve(user);
                    }
                });
            });
            if (!user)
                return reply.code(401).send({ message: "Invalid RefreshToken" });
            const friends = await (0, friends_1.acceptedFriends)(user);
            if (!friends)
                return reply.code(404).send({ message: "No friend Found" });
            reply.status(200).send({ friends });
        }
        catch (err) {
        }
    };
}
