"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendOtp = ResendOtp;
const playerExist_1 = require("../modules/playerExist");
const generateOtp_1 = require("../modules/generateOtp");
const db_1 = require("../databases/db");
function ResendOtp() {
    return async (req, reply) => {
        try {
            const { email } = req.body;
            const user = await (0, playerExist_1.playerExist)(email, "");
            if (!user)
                return reply.code(409).send({ message: "invalid email" });
            await new Promise((resolve, reject) => {
                db_1.db.run("DELETE FROM player_otps WHERE id = ?", [user.id], (err) => (err ? reject(err) : resolve()));
            });
            const otp = (0, generateOtp_1.generateOTP)();
            await (0, generateOtp_1.saveOTP)(user.id, otp, "email_verification", 30);
            await (0, generateOtp_1.sendVerificationEmail)(email, otp);
            return reply.status(200).send({
                message: "OTP resent successfully",
            });
        }
        catch (err) {
            console.log(err);
            return reply.status(500).send({ message: "Internal server error" });
        }
    };
}
