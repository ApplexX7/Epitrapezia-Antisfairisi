import { FastifyRequest, FastifyReply } from "fastify";
import bcrypt from 'bcrypt';
import { db } from "../databases/db";
import { generateAccessToken } from "../modules/generateTokens";
import jwt from "jsonwebtoken";

async function refreshTokenDate(token:string) {
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

async function verifyRefreshToken(refreshToken : string | any) : Promise<any>{
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM players WHERE  refreshToken = ?",
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
        });
  
        return reply.send({
          user,
          token: { accessToken },
        });
      } catch (err) {
        return reply.status(500).send({ message: "Failed to refresh token" });
      }
    };
  }
  