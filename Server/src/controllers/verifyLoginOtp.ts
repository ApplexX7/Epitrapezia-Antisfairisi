import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../databases/db";
import { generateAccessToken, generateRefreshToken } from "../modules/generateTokens";
import { storeRefrechTokenInDb } from "../modules/storeRefreshTokenInDb";

function mapUser(row: any) {
  if (!row) return null;
  let github = "";
  let instagram = "";
  
  if (row.socials) {
    try {
      const socials = JSON.parse(row.socials);
      github = socials.github ?? "";
      instagram = socials.instagram ?? "";
    } catch (e) {
      // If socials is not valid JSON, leave as empty strings
    }
  }
  
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    avatar: row.avatar,
    level: row.level || 1,
    experience: row.experience || 0,
    progression: (row.experience || 0) % 100,
    bio: row.bio ?? "",
    github,
    instagram,
    dateJoined: row.created_at ? new Date(row.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Joined recently",
    twoFactorEnabled: Boolean(row.two_factor_enabled),
  };
}

async function getUserWithProfile(playerId: number): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT p.*, COALESCE(pi.desp, '') AS bio, COALESCE(pi.socials, '') AS socials
       FROM players p
       LEFT JOIN player_infos pi ON pi.player_id = p.id
       WHERE p.id = ?`,
      [playerId],
      (err, row) => (err ? reject(err) : resolve(row))
    );
  });
}

export function VerifyLoginOtp() {
  return async (
    req: FastifyRequest<{ Body: { player_id: number; otp: string } }>,
    reply: FastifyReply
  ) => {
    const { player_id, otp } = req.body;

    if (!player_id || !otp) {
      return reply.status(400).send({ message: "OTP and player_id are required" });
    }

    try {
      const otpRecord: any = await new Promise((resolve, reject) => {
        db.get(
          "SELECT * FROM player_otps WHERE player_id = ? AND otp_code = ? AND purpose = ?",
          [player_id, otp, "login_2fa"],
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
          "DELETE FROM player_otps WHERE id = ?",
          [otpRecord.id],
          (err) => (err ? reject(err) : resolve())
        );
      });

      const userRow = await getUserWithProfile(player_id);
      const user = mapUser(userRow);

      if (!user) {
        return reply.status(404).send({ message: "User not found" });
      }

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
          message: "Two-factor authentication successful",
          user,
          token: { accessToken },
        });
    } catch (err) {
      console.error(err);
      return reply.status(400).send({ message: "Internal server error" });
    }
  };
}
