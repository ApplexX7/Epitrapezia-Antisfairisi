import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../databases/db";
import { User } from "../interfaces/userInterface";

export function  UserSearch(){
    return async (req : FastifyRequest<{ Querystring: { query: string } }>,
        reply : FastifyReply
    ) => {
        const { query } = req.query;
        if (!query || query.trim() === "")
            return reply.code(400).send({ error: "Missing search query" });
        const user = (req as any).user as User;
        if (!user) 
            return reply.code(401).send({ message: "Not authenticated" });
        try{
            const result : User[] = await new Promise<User[]>((resolve, reject) => {
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
            const friends = await new Promise<{ friend_id: number; status: string }[]>((resolve, reject) => {
                db.all(
                    "SELECT friend_id, status FROM friends WHERE player_id = ?",
                    [user.id],
                    (err, friends) => {
                        if (err)
                            reject(err);
                        else
                            resolve(friends as { friend_id: number; status: string }[]);
                    }
                );
            })
            const filtered = result
            .filter(u => u.id !== user.id)
            .map(u => {
              const f = friends.find(f => f.friend_id === u.id);
              return {
                id: u.id,
                username: u.username,
                firstname: u.firstname,
                avatar: u.avatar,
                friendstatus: f?.status ?? "none",
              };
            });
            console.log(filtered);
            return reply.send({
                result : filtered,
            })
        } catch(err){
            return reply.code(500).send({ error: "Database error" });
        }
    }
}