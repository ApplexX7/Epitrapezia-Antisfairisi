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
            const friends = await new Promise<{ friend_id: number; player_id: number; status: string }[]>((resolve, reject) => {
                db.all(
                  `
                  SELECT player_id, friend_id, status
                  FROM friends
                  WHERE player_id = ? OR friend_id = ?
                  `,
                  [user.id, user.id],
                  (err, friends) => {
                    if (err) reject(err);
                    else resolve(friends as { friend_id: number; player_id: number; status: string }[]);
                  }
                );
            });
            const filtered = result
            .filter(u => u.id !== user.id)
            .map(u => {
              const f = friends.find(
                f =>
                  (f.player_id === user.id && f.friend_id === u.id) ||
                  (f.friend_id === user.id && f.player_id === u.id)
              );
          
              let friendstatus = "none";
              if (f) {
                if (f.status === "pending" && f.player_id === user.id)
                  friendstatus = "pending";
                else if (f.status === "pending" && f.friend_id === user.id)
                  friendstatus = "incoming";
                else if (f.status === "accepted")
                  friendstatus = "accepted";
              }
              return {
                id: u.id,
                username: u.username,
                firstname: u.firstname,
                avatar: u.avatar,
                friendstatus,
              };
            });
            return reply.send({
                result : filtered,
            })
        } catch(err){
            return reply.code(400).send({ error: "Database error" });
        }
    }
}