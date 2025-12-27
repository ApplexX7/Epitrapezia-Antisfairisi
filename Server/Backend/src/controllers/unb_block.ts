import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../databases/db";
import { User } from "../interfaces/userInterface";

// ✅ Fixed type definition
interface BlockUserRequest {
    Body: {
        friendId: number;
    }
}

export async function blockUser(
    req: FastifyRequest<BlockUserRequest>, 
    reply: FastifyReply
) {
    const { id } = (req as any).user as User;
    const { friendId } = req.body;
    
    if (!id || !friendId)
        return reply.code(400).send({ message: "Invalid request" });

    try {
        await new Promise<void>((resolve, reject) => {
            db.run(
                `INSERT OR IGNORE INTO block (blocker_id, blocked_id) VALUES (?, ?)`,
                [id, friendId],  // ✅ Fixed: Only 2 values
                (err) => err ? reject(err) : resolve()
            );
        });
        
        return reply.send({ message: "User blocked successfully" });
    } catch(err) {
        console.error("Block user error:", err);
        return reply.code(500).send({ message: `Database Error: ${err}` });
    }
}

// In your friendsRequest controller
export async function unblockUser(req: FastifyRequest<{ Body: { friendId: number } }>, reply: FastifyReply) {
    const { id } = (req as any).user as User;
    const { friendId } = req.body;

    try {
        await new Promise<void>((resolve, reject) => {
            // This MUST match the blocker_id and blocked_id exactly
            db.run(
                `DELETE FROM block WHERE blocker_id = ? AND blocked_id = ?`,
                [id, friendId], 
                (err) => (err ? reject(err) : resolve())
            );
        });
        return reply.send({ success: true, message: "User unblocked successfully" });
    } catch (err) {
        return reply.code(500).send({ message: "Database Error" });
    }
}