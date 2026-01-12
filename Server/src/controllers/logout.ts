import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../databases/db";
import { verifyRefreshToken } from "./authRefresh";
import bcrypt from 'bcrypt';


export function Logout(){
    return async (req : FastifyRequest, reply : FastifyReply) => {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken)
                return reply.status(401).send({ message: "No refresh token" });
            const user = await verifyRefreshToken(refreshToken);
            if (!user)
                return reply.status(403).send({ message: "Invalid refresh token" });
            await new Promise<void>((resolve, reject) => {
                db.run(
                  "UPDATE players SET refreshToken = NULL WHERE refreshToken = ?",
                  [refreshToken],
                  (err) => {
                    if (err) reject(err);
                    else resolve();
                  }
                );
              });
            reply.clearCookie("refreshToken", { path: "/" });
            return reply.status(200).send({message: "Player logged out successfully"});
        } catch (err){
            return reply.status(400).send({ message: "Failed to  Log out" });
        }
    }
}