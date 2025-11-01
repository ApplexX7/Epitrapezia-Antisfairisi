"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayerById = getPlayerById;
exports.VerifyOtp = VerifyOtp;
const storeRefreshTokenInDb_1 = require("../modules/storeRefreshTokenInDb");
const generateTokens_1 = require("../modules/generateTokens");
const db_1 = require("../databases/db");
async function getPlayerById(playerId) {
    return new Promise((resolve, reject) => {
        db_1.db.get("SELECT * FROM players WHERE id = ?", [playerId], (err, user) => err ? reject(err) : resolve(user));
    });
}
function VerifyOtp() {
    return async (req, reply) => {
        const { player_id, otp } = req.body;
        console.log(player_id, "   ", otp);
        if (!player_id || !otp) {
            return reply.status(400).send({ message: "OTP and player_id are required" });
        }
        try {
            const otpRecord = await new Promise((resolve, reject) => {
                db_1.db.get("SELECT * FROM player_otps WHERE player_id = ? AND otp_code = ? AND purpose = ?", [player_id, otp, "email_verification"], (err, row) => (err ? reject(err) : resolve(row)));
            });
            if (!otpRecord) {
                return reply.status(400).send({ message: "Invalid OTP" });
            }
            const now = new Date();
            const expireAt = new Date(otpRecord.expires_at);
            if (now > expireAt) {
                return reply.status(400).send({ message: "OTP expired" });
            }
            await new Promise((resolve, reject) => {
                db_1.db.run("UPDATE players SET is_verified = 1 WHERE id = ?", [player_id], (err) => (err ? reject(err) : resolve()));
            });
            await new Promise((resolve, reject) => {
                db_1.db.run("DELETE FROM player_otps WHERE id = ?", [otpRecord.id], (err) => (err ? reject(err) : resolve()));
            });
            const user = await getPlayerById(player_id);
            const accessToken = (0, generateTokens_1.generateAccessToken)(user);
            const refreshToken = (0, generateTokens_1.generateRefreshToken)(user);
            await (0, storeRefreshTokenInDb_1.storeRefrechTokenInDb)(refreshToken, user);
            return reply
                .setCookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60,
                path: "/",
            })
                .status(200)
                .send({
                message: "Email verified successfully",
                user,
                token: { accessToken },
            });
        }
        catch (err) {
            console.error(err);
            return reply.status(500).send({ message: "Internal server error" });
        }
    };
}
