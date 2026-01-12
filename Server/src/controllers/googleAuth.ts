import { FastifyRequest, FastifyReply } from "fastify";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcrypt";
import { db, ensureGameStatsForPlayer } from "../databases/db";
import { playerExist } from "../modules/playerExist";
import { generateRefreshToken } from "../modules/generateTokens";
import { storeRefrechTokenInDb } from "../modules/storeRefreshTokenInDb";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
// Prefer a relative redirect so the browser will be sent back to the same host/port
// that initiated the OAuth flow (works with reverse proxies). If you need an
// absolute URL, set FRONTEND_REDIRECT in env and uncomment the line below.
// const FRONTEND_REDIRECT = process.env.FRONTEND_REDIRECT || "https://localhost:443/Home";

const googleClient = new OAuth2Client(CLIENT_ID);

function generateRandomPassword(length: number = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function GoogleAuthRedirection(req: FastifyRequest, reply: FastifyReply) {
  const authUrl =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    `client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=openid%20email%20profile` +
    `&access_type=offline` +
    `&prompt=consent`;
  reply.redirect(authUrl);
}

export async function GoogleAuthCallback(req: FastifyRequest, reply: FastifyReply) {
  const { code } = req.query as { code?: string };
  if (!code) return reply.code(400).send({ message: "Missing authorization code" });

  try {
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { id_token, access_token, refresh_token } = tokenResponse.data;

    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new Error("Invalid Google ID token");

    const { email, given_name, family_name, name, picture, sub: googleId } = payload;
    if (!email || !name) return reply.code(400).send({ message: "Missing user data" });
    const normalizedEmail = email.toLowerCase();
    let user = await playerExist(normalizedEmail, name);
    if (user){
      if (user.auth_Provider === 'local')
        return reply.code(403).send({message: "Please log with your google account"})
    }
    else {
      const username = ("@" + email.split("@")[0]).toLowerCase();
      const password = generateRandomPassword(8);
      const hashPassword = await bcrypt.hash(password, 10);

      const userId = await new Promise<number>((resolve, reject) => {
        db.run(
          `INSERT INTO players (firstName, lastName, username, email, password, avatar, is_verified, auth_Provider)
           VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
          [
            given_name || "",
            family_name || "",
            username,
            normalizedEmail,
            hashPassword,
            picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(given_name + " " + family_name)}&background=random&color=fff&size=128`,
            "google",
          ],
          function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
      user = {
        id: userId,
        firstName: given_name,
        lastName: family_name,
        username: username,
        email: normalizedEmail,
        avatar: picture,
        auth_Provider: "google",
      };
    }
    // added by moniam
    try {
      await ensureGameStatsForPlayer(user.id);
    } catch (e) {
      console.error('Could not ensure game_stats for user', user.id, e);
    }
    // ebd
    const appRefreshToken = generateRefreshToken(user);
    await storeRefrechTokenInDb(appRefreshToken, user);

    reply.setCookie("refreshToken", appRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

  // Use a relative redirect so the client is redirected back to the same origin
  // that started the OAuth flow. This avoids issues when nginx is publishing
  // TLS on a non-standard host port (e.g. 8443) while the server is unaware.
  reply.redirect('/Home');
  } catch (err: any) {
    console.error("Google OAuth callback error:", err.response?.data || err);
    reply.code(400).send({ message: "Google OAuth failed" });
  }
}
