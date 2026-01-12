import { db } from "../databases/db";
import { SendEmail } from "./mailer";

export function generateOTP(length = 6) {
  let otp = "";
  const chars = "0123456789";
  for (let i = 0; i < length; i++) {
    otp += chars[Math.floor(Math.random() * chars.length)];
  }
  return otp;
}

export function saveOTP(
  player_id: number,
  otp: string,
  purpose = "email_verification",
  expiresInSeconds = 1800
) {
  const expires_at = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
  db.run(
    "INSERT INTO player_otps (player_id, otp_code, purpose, expires_at) VALUES (?, ?, ?, ?)",
    [player_id, otp, purpose, expires_at]
  );
}

export async function sendVerificationEmail(email: string, otp: string) {
  const html = `
    <h2>Verify your email</h2>
    <p>Your OTP code is: <b>${otp}</b></p>
    <p>This code will expire in 30 seconds.</p>
  `;

  await SendEmail(email, "Email Verification", html);
}