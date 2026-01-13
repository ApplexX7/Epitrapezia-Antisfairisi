import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../databases/db";
import { User } from "../interfaces/userInterface";
import { Server } from "../server";
import { Message } from "../routers/message";

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
              (err : any, data : any) => (err ? reject(err) : resolve(data))
            );
          });
        if (existing.length > 0)
            return reply.code(400).send({message : "Request already  send"});
        await new Promise<void>((resolve, reject) => {
            db.run(
                `INSERT INTO friends (player_id, friend_id, status)
                VALUES (?, ?, 'pending')`,
            [id, friendId],
            (err : any) => {err ? reject(err) : resolve()}
            )
        });
        const sender = await new Promise<any>((resolve, reject) => {
            db.get(`SELECT username FROM players WHERE id = ?`, [id], (err : any, row : any) => err ? reject(err) : resolve(row));
          });
        const io = Server.socket();
        const payload = {
            from: { id, username: sender.username },
            message: `${sender.username} sent you a friend request`
        };
        io.to(String(friendId)).emit("notification", {
            type: "friend-request",
            message: payload.message,
            from: payload.from,
            time: new Date().toISOString(),
        });
        return reply.send({ success: true, message: "Friend request sent" });
    } catch(err){
        return reply.code(400).send({mesage : `Database Error : ${err}`})
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
        // Check if the friend request exists
        const existing = await new Promise<any>((resolve, reject) => {
            db.get(
                `SELECT * FROM friends
                WHERE ((player_id = ? AND friend_id = ?) 
                OR (player_id = ? AND friend_id = ?))
                AND status = 'pending'`,
                [id, friendId, friendId, id],
                (err : any, row : any) => (err ? reject(err) : resolve(row))
            );
        });

        if (!existing) {
            return reply.code(404).send({message : "Friend request not found or already handled"});
        }

        const update = await new Promise<void>((resolve, reject) => {
            db.run(
                `
                UPDATE friends
                SET status = 'accepted'
                WHERE ((player_id = ? AND friend_id = ?) 
                OR (player_id = ? AND friend_id = ?))
                AND status = 'pending'
                `,[id, friendId, friendId, id],
                (err : any) => (err ? reject(err) : resolve())
            );
        })

        // Notify requester that their invite was accepted
        const io = Server.socket();
        const accepter = await new Promise<any>((resolve, reject) => {
            db.get(`SELECT username FROM players WHERE id = ?`, [id], (err : any, row : any) => err ? reject(err) : resolve(row));
          });

        io.to(String(friendId)).emit("notification", {
            type: "friend-accepted",
            message: `${accepter?.username || "A friend"} accepted your request`,
            from: { id, username: accepter?.username },
            time: new Date().toISOString(),
        });
        
        // Notify the accepter's other sessions to update their notifications
        io.to(String(id)).emit("friend-request-handled", { friendId, action: "accept" });
        
        return reply.send({message : "Friend Request accepted succefully "})
    } catch(err){
        console.error("Error accepting friend request:", err)
        return reply.code(400).send({message : `Database Error`, error: String(err)})
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
                (err : any) => err ? reject(err) : resolve()
            );
        })
        
        // Notify the other user that the friend request was cancelled/removed
        const io = Server.socket();
        const remover = await new Promise<any>((resolve, reject) => {
            db.get(`SELECT username FROM players WHERE id = ?`, [id], (err : any, row : any) => err ? reject(err) : resolve(row));
        });
        
        io.to(String(friendId)).emit("notification", {
            type: "friend-request-cancelled",
            message: `Friend request was cancelled`,
            from: { id, username: remover?.username },
            time: new Date().toISOString(),
        });
        
        // Notify the remover's other sessions to update their notifications
        io.to(String(id)).emit("friend-request-handled", { friendId, action: "decline" });
        
        return reply.send({ message : "Friend Request rejected successfully"});
    }catch (err){
        return reply.code(400).send({mesage : `Database Error : ${err}`})

    }
}

