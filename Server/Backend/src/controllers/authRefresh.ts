import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../databases/db";
import { generateAccessToken } from "../modules/generateTokens";
import jwt from "jsonwebtoken";

export async function refreshTokenDate(token:string) {
    try{
        const secret = process.env.REFRESH_TOKEN
        if (!secret) {
            throw new Error("REFRESH_TOKEN is not defined in .env");
        }
        const payload = jwt.verify(token, secret);
        return payload
    }catch(err){
        return null;
    }
}

export async function verifyRefreshToken(refreshToken : string | any) : Promise<any>{
    return new Promise((resolve, reject) => {
        db.get(
      `SELECT p.*, COALESCE(pi.desp, '') AS bio, COALESCE(pi.socials, '') AS socials
       FROM players p
       LEFT JOIN player_infos pi ON pi.player_id = p.id
       WHERE p.refreshToken = ?`,
      [refreshToken],
      (err, exist) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(exist);
                }
            }
        );
    });
}

export function RefreshToken() {
    return async (req: FastifyRequest, reply: FastifyReply) => {
      try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
          return reply.status(401).send({ message: "No refresh token" });
        }
        const expiredDate =  await refreshTokenDate(refreshToken);
        if (!expiredDate)
            return reply.status(403).send( {message: "RefreshToken Expired"})
        const user = await verifyRefreshToken(refreshToken);
        if (!user) {
          return reply.status(403).send({ message: "Invalid refresh token" });
        }
        const accessToken = generateAccessToken({
          id: user.id,
          username: user.username,
          email: user.email,
          firstname : user.firstName,
          lastName : user.lastName,
        });

        const sanitizedUser = {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          level: user.level || 1,
          experience: user.experience || 0,
          progression: (user.experience || 0) % 100,
          bio: user.bio ?? "",
          github: user.socials ? (() => { try { return JSON.parse(user.socials).github ?? ""; } catch { return ""; } })() : "",
          instagram: user.socials ? (() => { try { return JSON.parse(user.socials).instagram ?? ""; } catch { return ""; } })() : "",
          dateJoined: user.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Joined recently",
          twoFactorEnabled: Boolean(user.two_factor_enabled),
        };

        return reply.send({
          user: sanitizedUser,
          token: { accessToken },
        });
      } catch (err) {
        return reply.status(500).send({ message: "Failed to refresh token" });
      }
    };
  }
  