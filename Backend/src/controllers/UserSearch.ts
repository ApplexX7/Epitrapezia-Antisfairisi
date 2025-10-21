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
            const friends : number[] = await new Promise<number[]>((resolve, reject) => {
                db.all(
                    "SELECT friend_id FROM friends WHERE player_id = ?",
                    [user.id],
                    (err, friends) => {
                        if (err)
                            reject(err);
                        else
                            resolve(friends.map((r : any) => r.friend_id));
                    }
                );
            })
            const filtered = result
            .filter(u => u.id !== user.id)
            .map(u => ({
              id: u.id,
              username: u.username,
              firstname: u.firstname,
              avatar: u.avatar,
              isFriend: friends.includes(u.id),
            }));
            return reply.send({
                result : filtered,
            })
        } catch(err){
            return reply.code(500).send({ error: "Database error" });
        }
    }
}