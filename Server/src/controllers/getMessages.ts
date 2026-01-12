import { FastifyRequest, FastifyReply} from "fastify";
import { db } from "../databases/db";

export function getMessages(sender_id: number, receiver_id: number): Promise<any[]> {
  console.log("📚 getMessages called with:", { sender_id, receiver_id });
  
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM message
      WHERE (sender_id = ? AND receiver_id = ?)
        OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `;
    
    db.all(query, [sender_id, receiver_id, receiver_id, sender_id], (err : any, rows : any) => {
      if (err) {
        console.error("❌ DB Error in getMessages:", err);
        reject(err);
      } else {
        console.log("✅ Retrieved rows:", rows);
        resolve(rows);
      }
    });
  });
}
