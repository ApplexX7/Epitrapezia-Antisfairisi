
import {FastifyRequest, FastifyReply} from "fastify";
import { db } from "../databases/db";

export function saveMessage(sender_id: number, receiver_id: number, content: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO message (sender_id, receiver_id, content) VALUES (?, ?, ?)`;
    
    db.run(query, [sender_id, receiver_id, content], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}