"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = generateOTP;
exports.saveOTP = saveOTP;
exports.sendVerificationEmail = sendVerificationEmail;
const db_1 = require("../databases/db");
function generateOTP(length = 6) {
    let otp = "";
    const chars = "0123456789";
    for (let i = 0; i < length; i++) {
        otp += chars[Math.floor(Math.random() * chars.length)];
    }
    return otp;
}
function saveOTP(player_id, otp, purpose = "email_verification", expiresInSeconds = 1800) {
    const expires_at = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
    db_1.db.run("INSERT INTO player_otps (player_id, otp_code, purpose, expires_at) VALUES (?, ?, ?, ?)", [player_id, otp, purpose, expires_at]);
}
const mailer_1 = require("./mailer");
async function sendVerificationEmail(email, otp) {
    const html = `
    <h2>Verify your email</h2>
    <p>Your OTP code is: <b>${otp}</b></p>
    <p>This code will expire in 30 seconds.</p>
  `;
    await (0, mailer_1.SendEmail)(email, "Email Verification", html);
}
