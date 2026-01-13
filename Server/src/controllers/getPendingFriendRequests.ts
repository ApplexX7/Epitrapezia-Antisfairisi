import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../databases/db";
import { User } from "../interfaces/userInterface";

export async function getPendingFriendRequests(req: FastifyRequest, reply: FastifyReply) {
  const { id } = (req as any).user as User;
  if (!id) {
    return reply.code(401).send({ message: "Not Authorized" });
  }

  try {
    const requests = await new Promise<any[]>((resolve, reject) => {
      db.all(
        `SELECT 
          f.id,
          f.player_id as senderId,
          p.username as senderUsername,
          p.avatar as senderAvatar,
          f.created_at,
          f.status
        FROM friends f
        INNER JOIN players p ON f.player_id = p.id
        WHERE f.friend_id = ? AND f.status = 'pending'
        ORDER BY f.created_at DESC`,
        [id],
        (err : any, rows : any) => (err ? reject(err) : resolve(rows || []))
      );
    });

    return reply.send({
      success: true,
      requests: requests,
      count: requests.length,
    });
  } catch (err) {
    return reply.code(400).send({ message: "Database Error" });
  }
}
