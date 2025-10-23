import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../databases/db";
import { User } from "../interfaces/userInterface";

export async function FriendRequest(req : FastifyRequest<{Body:{friendId : number}}>, reply : FastifyReply){    
    const { id } = (req as any).user as User;
    const { friendId }  = req.body;
    if (!id)
        return reply.code(400).send({message : "Not Authorized"});
    if (!friendId)
        return reply.code(400).send({message : " Cant not invite yourself "});
    try{
        const existing = await new Promise<any[]>((resolve, reject) => {
            db.all(
              `SELECT * FROM friends
               WHERE (player_id = ? AND friend_id = ?)
               OR (player_id = ? AND friend_id = ?)`,
              [id, friendId, friendId, id],
              (err, data) => (err ? reject(err) : resolve(data))
            );
          });
        if (existing.length > 0)
            return reply.code(400).send({message : "Request already  send"});
        await new Promise<void>((resolve, reject) => {
            db.run(
                `INSERT INTO friends (player_id, friend_id, status)
                VALUES (?, ?, 'pending')`,
            [id, friendId],
            (err) => {err ? reject(err) : resolve()}
            )
        });
        return reply.send({ success: true, message: "Friend request sent" });
    } catch(err){
        console.log(err);
        return reply.code(500).send({mesage : `Database Error : ${err}`})
    }
}


export async function  AccepteFriendRequest(req : FastifyRequest<{Body: {friendId : number}}>, reply : FastifyReply) {
    const { id } = (req as any).user as User;
    const { friendId } = req.body;
    if (!id)
        return reply.code(400).send({message : "Not Authorized"});
    if (!friendId)
        return reply.code(400).send({ message: "Missing friendId" });
    try {
        const update = await new Promise<void>((resolve, reject) => {
            db.run(
                `
                UPDATE friends
                SET status = 'accepted'
                WHERE ((player_id = ? AND friend_id = ?) 
                OR (player_id = ? AND friend_id = ?))
                AND status = 'pending'
                `,[id, friendId, friendId, id],
                (err) => (err ? reject(err) : resolve())
            );
        })
        return reply.send({message : "Friend Request accepted succefully "})
    } catch(err){
        console.log(err)
        return reply.code(500).send({mesage : `Database Error : ${err}`})
    }

}

export async function RemoveFriendRequest(req : FastifyRequest<{Body:{friendId : number}}>, reply : FastifyReply) {
    const { id } = (req as any ).user as User;
    const { friendId } = req.body
    if (!id)
        return reply.code(400).send({message : "Not Authorized"});
    if (!friendId)
        return reply.code(400).send({message : " Cant not invite yourself "});
    try {
        await new Promise<void>((resolve, reject) => {
            db.run(
                `
                DELETE FROM friends
                WHERE ((player_id = ? AND friend_id = ?)
                OR (player_id = ? AND friend_id = ?))
                AND status = 'pending'
                `, [id, friendId, friendId, id],
                (err) => err ? reject(err) : resolve()
            );
        })
        return reply.send({ message : "Friend Request rejected successfully"});
    }catch (err){
        return reply.code(500).send({mesage : `Database Error : ${err}`})

    }
}