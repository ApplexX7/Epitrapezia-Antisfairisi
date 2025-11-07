"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logout = Logout;
const db_1 = require("../databases/db");
const authRefresh_1 = require("./authRefresh");
function Logout() {
    return async (req, reply) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken)
                return reply.status(401).send({ message: "No refresh token" });
            const user = await (0, authRefresh_1.verifyRefreshToken)(refreshToken);
            if (!user)
                return reply.status(403).send({ message: "Invalid refresh token" });
            await new Promise((resolve, reject) => {
                db_1.db.run("UPDATE players SET refreshToken = NULL WHERE refreshToken = ?", [refreshToken], (err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            });
            reply.clearCookie("refreshToken", { path: "/" });
            return reply.status(200).send({ message: "Player logged out successfully" });
        }
        catch (err) {
            return reply.status(500).send({ message: "Failed to  Log out" });
        }
    };
}
