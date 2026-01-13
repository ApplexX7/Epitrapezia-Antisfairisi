import { FastifyRequest, FastifyReply } from "fastify";
import { storeRefrechTokenInDb } from '../modules/storeRefreshTokenInDb';
import { generateRefreshToken, generateAccessToken } from '../modules/generateTokens';
import { db } from "../databases/db";

export async function getPlayerById(playerId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM players WHERE id = ?", [playerId], (err, user) =>
      err ? reject(err) : resolve(user)
    );
  });
}

export function VerifyOtp() {
  return async (
    req: FastifyRequest<{ Body: { player_id: number; otp: string } }>,
    reply: FastifyReply
  ) => {
    const { player_id, otp } = req.body;
    console.log(player_id, "   ",otp)
    if (!player_id || !otp) {
      return reply.status(400).send({ message: "OTP and player_id are required" });
    }

    try {
      const otpRecord: any = await new Promise((resolve, reject) => {
        db.get(
          "SELECT * FROM player_otps WHERE player_id = ? AND otp_code = ? AND purpose = ?",
          [player_id, otp, "email_verification"],
          (err, row) => (err ? reject(err) : resolve(row))
        );
      });

      if (!otpRecord) {
        return reply.status(400).send({ message: "Invalid OTP" });
      }

      const now = new Date();
      const expireAt = new Date(otpRecord.expires_at);
      if (now > expireAt) {
        return reply.status(400).send({ message: "OTP expired" });
      }

      await new Promise<void>((resolve, reject) => {
        db.run(
          "UPDATE players SET is_verified = 1 WHERE id = ?",
          [player_id],
          (err) => (err ? reject(err) : resolve())
        );
      });

      await new Promise<void>((resolve, reject) => {
        db.run(
          "DELETE FROM player_otps WHERE id = ?",
          [otpRecord.id],
          (err) => (err ? reject(err) : resolve())
        );
      });

      const user = await getPlayerById(player_id);
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      await storeRefrechTokenInDb(refreshToken, user);

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
    } catch (err) {
      return reply.status(400).send({ message: "Internal server error" });
    }
  };
}
