import { Server } from "../server";
import { db } from "../databases/db";
import {FastifyReply, FastifyRequest} from "fastify";

export type MarkSeenBody = {
  message_ids: number[];
  user_id: number;
};

export function seenMsg() {
  Server.instance().post("/message/mark-seen", async (req : FastifyRequest, reply : FastifyReply) => {
    const { message_ids, user_id } = req.body as MarkSeenBody;

    if (!message_ids?.length) {
      return reply.code(400).send({ error: "No messages to mark" });
    }

    const placeholders = message_ids.map(() => "?").join(", ");
    const query = `UPDATE message SET seen = 1 WHERE id IN (${placeholders}) AND receiver_id = ?`;

    await db.run(query, [...message_ids, user_id], function (err : any) {
      if (err) return reply.code(500).send({ error: err.message });
      reply.send({ success: true, updated_count: (this as any).changes });
    });
  });
}
