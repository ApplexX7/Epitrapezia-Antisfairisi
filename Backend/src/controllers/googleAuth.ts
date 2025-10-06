import { FastifyRequest, FastifyReply } from "fastify";
import axios from "axios";
import { db } from "../databases/db";
import { playerExist } from "../modules/playerExist";
import { generateAccessToken, generateRefreshToken } from "../modules/generateTokens";
import { storeRefrechTokenInDb } from "../modules/storeRefreshTokenInDb";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

export async function GoogleAuthRedirect(req: FastifyRequest, reply: FastifyReply) {
  const authUrl =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "consent",
    }).toString();

  reply.redirect(authUrl);
}

export async function GoogleAuthCallback(
  req: FastifyRequest<{ Querystring: { code?: string } }>,
  reply: FastifyReply
) {
  const code = req.query.code;
  if (!code) return reply.code(400).send({ message: "Code not found" });

  try {
    const params = new URLSearchParams();
    params.append("code", code);
    params.append("client_id", CLIENT_ID);
    params.append("client_secret", CLIENT_SECRET);
    params.append("redirect_uri", REDIRECT_URI);
    params.append("grant_type", "authorization_code");

    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      params.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { id_token } = tokenResponse.data;

    const payload = JSON.parse(Buffer.from(id_token.split(".")[1], "base64").toString());
    const { email, given_name, family_name, name, picture, sub: googleId } = payload;

    if (!email || !name) return reply.code(400).send({ message: "Invalid Google profile" });

    let user = await playerExist(email, name);

    if (!user) {
      const userId = await new Promise<number>((resolve, reject) => {
        db.run(
          `INSERT INTO players (firstName, lastName, username, email, password, avatar, is_verified, googleId)
           VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
          [given_name, family_name, name, email, "", picture || "/images/defaultAvatare.jpg", googleId],
          function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      user = { id: userId, firstName: given_name, lastName: family_name, username: name, email, avatar: picture };
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await storeRefrechTokenInDb(refreshToken, user);

    reply
      .setCookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
      })
      .redirect(`http://localhost:3000/Home?token=${accessToken}`);
  } catch (err: any) {
    console.error("Google OAuth callback error:", err.response?.data || err);
    reply.code(500).send({ message: "Google OAuth failed" });
  }
}
