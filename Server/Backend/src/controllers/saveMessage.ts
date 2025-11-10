// saveMessage.ts
import {FastifyRequest, FastifyReply} from "fastify";
import { db } from "../databases/db";

export function saveMessage(sender_id: number, receiver_id: number, content: string): Promise<number> {
  console.log("💾 saveMessage called with:", { sender_id, receiver_id, content });
  
  return new Promise((resolve, reject) => {
    const query = `INSERT INTO message (sender_id, receiver_id, content) VALUES (?, ?, ?)`;
    
    db.run(query, [sender_id, receiver_id, content], function (err) {
      if (err) {
        console.error("❌ DB Error in saveMessage:", err);
        reject(err);
      } else {
        console.log("✅ Message inserted with ID:", this.lastID);
        resolve(this.lastID);
      }
    });
  });
}