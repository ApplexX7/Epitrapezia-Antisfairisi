import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../databases/db";
import { User } from "../interfaces/userInterface";

export async function Friendship(req: FastifyRequest<{ Body: { id: number } }>, reply: FastifyReply) {
  const { id } = req.body;
  if (!id) {
    return reply.code(401).send({ message: "Not Authorized" });
  }

  try {
    const friendList: User[] = await new Promise((resolve, reject) => {
      db.all(
        `
        SELECT p.id, p.username, p.avatar
        FROM friends f
        JOIN players p
          ON (p.id = f.friend_id AND f.player_id = ?)
             OR (p.id = f.player_id AND f.friend_id = ?)
        WHERE f.status = 'accepted'
          AND p.id NOT IN (
            SELECT blocked_id FROM block WHERE blocker_id = ?
          )
          AND p.id NOT IN (
            SELECT blocker_id FROM block WHERE blocked_id = ?
          );
        `,
        [id, id, id, id],
        (err: any, rows: User[]) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
    const friend = friendList.map(friend => ({
      ...friend,
      isOnline: false,
    }));
    return reply.send({ friendList : friend });
  } catch (err: any) {
    console.error(err);
    return reply.code(400).send({ message: "Internal Server Error" });
  }
}
