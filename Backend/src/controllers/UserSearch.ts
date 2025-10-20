import { FastifyRequest, FastifyReply } from "fastify";
import bcrypt from 'bcrypt';
import { db } from "../databases/db";
import { User } from "../interfaces/userInterface";

export function  UserSearch(){
    return async (req : FastifyRequest<{ Querystring: { query: string } }>,
        reply : FastifyReply
    ) => {
        const { query } = req.query;
        if (!query || query.trim() === "")
            return reply.code(400).send({ error: "Missing search query" });
        try{
            const result : User[] = await new Promise((resolve, reject) => {
                db.all(
                    "SELECT * FROM players WHERE username LIKE ? OR firstname LIKE ?",
                    [`%${query}%`, `%${query}%`],
                    (err, list) => {
                        if (err){
                            reject(err);
                        }else
                            resolve(list as User[]);
                    });
            })
            const filtered = result.map((user :User ) => ({
                id: user.id,
                username: user.username,
                firstname: user.firstname,
              }));
            return reply.send({
                result,
            })
        } catch(err){
            return reply.code(500).send({ error: "Database error" });
        }
    }
}