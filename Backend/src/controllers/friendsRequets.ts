import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../databases/db";
import { User } from "../interfaces/userInterface";

export async function FriendRequest(req : FastifyRequest<{Body:{friendId : number}}>, reply : FastifyReply){
    const user = (req as any).user as User;
    const { friendId }  = req.body;
    if (!user)
        return reply.code(400).send({message : "Not Authorized"});
    if (!friendId)
        return reply.code(400).send({message : " Cant not invite yourself "});

    try{
        const existing = await new Promise<any[]>((resolve, reject) => {
            db.all(
                `SELECT * FROM friends
                 WEHRE (player_id = ? AND  friend_id= ?)
                 OR (player_id = ? AND friend_id = ?)`,
                 [user.id, friendId, friendId, user?.id],
                 (err, data) => {err ? reject(err) : resolve(data)}
            )
        })
        if (existing.length > 0)
            return reply.code(400).send({message : "Request already  send"});
        await new Promise<void>((resolve, reject) => {
            db.run(
                `INSERT INTO friends (player_id, friend_id, status)
                VALUES (?, ?, 'pending')`,
            [user.id, friendId],
            (err) => {err ? reject(err) : resolve()}
            )
        });
        return reply.send({ success: true, message: "Friend request sent" });
    } catch(err){
        return reply.code(500).send({ message: "Database error" });
    }
}