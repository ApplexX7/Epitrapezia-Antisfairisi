"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenDate = refreshTokenDate;
exports.verifyRefreshToken = verifyRefreshToken;
exports.RefreshToken = RefreshToken;
const db_1 = require("../databases/db");
const generateTokens_1 = require("../modules/generateTokens");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
async function refreshTokenDate(token) {
    try {
        const secret = process.env.REFRESH_TOKEN;
        if (!secret) {
            throw new Error("REFRESH_TOKEN is not defined in .env");
        }
        const payload = jsonwebtoken_1.default.verify(token, secret);
        return payload;
    }
    catch (err) {
        return null;
    }
}
async function verifyRefreshToken(refreshToken) {
    return new Promise((resolve, reject) => {
        db_1.db.get("SELECT * FROM players WHERE  refreshToken = ?", [refreshToken], (err, exist) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(exist);
            }
        });
    });
}
function RefreshToken() {
    return async (req, reply) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return reply.status(401).send({ message: "No refresh token" });
            }
            const expiredDate = await refreshTokenDate(refreshToken);
            if (!expiredDate)
                return reply.status(403).send({ message: "RefreshToken Expired" });
            const user = await verifyRefreshToken(refreshToken);
            if (!user) {
                return reply.status(403).send({ message: "Invalid refresh token" });
            }
            const accessToken = (0, generateTokens_1.generateAccessToken)({
                id: user.id,
                username: user.username,
                email: user.email,
                firstname: user.firstName,
                lastName: user.lastName,
            });
            return reply.send({
                user,
                token: { accessToken },
            });
        }
        catch (err) {
            return reply.status(500).send({ message: "Failed to refresh token" });
        }
    };
}
