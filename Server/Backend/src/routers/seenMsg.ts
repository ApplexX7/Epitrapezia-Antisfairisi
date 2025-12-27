import { Server } from "../server";
import { db } from "../databases/db";

export type MarkSeenBody = {
  message_ids: number[];
  user_id: number;
};

export function seenMsg() {
  Server.instance().post("/message/mark-seen", async (req, reply) => {
    const { message_ids, user_id } = req.body as MarkSeenBody;

    if (!message_ids?.length) {
      return reply.code(400).send({ error: "No messages to mark" });
    }

    const placeholders = message_ids.map(() => "?").join(", ");
    const query = `UPDATE message SET seen = 1 WHERE id IN (${placeholders}) AND receiver_id = ?`;

    db.run(query, [...message_ids, user_id], function (err) {
      if (err) return reply.code(500).send({ error: err.message });
      reply.send({ success: true, updated_count: this.changes });
    });
  });
}
