import { Server } from "../server";
import { saveMessage } from "../controllers/saveMessage";
import { getMessages } from "../controllers/getMessages";
import { Sendmessagebody, Historyquery } from "../interfaces/Messages";
import { db } from "../databases/db"; // Import your database connection

export function Message() {
    Server.instance().post("/message/send", async(req, reply) => {
        const { sender_id, receiver_id, content } = req.body as Sendmessagebody;
        
        try {
            // 1. Check if the RECEIVER has blocked the SENDER
            // In your message.ts route
            const isBlocked = await new Promise((resolve) => {
                db.get(
                    `SELECT id FROM block 
                     WHERE (blocker_id = ? AND blocked_id = ?) 
                     OR (blocker_id = ? AND blocked_id = ?)`, 
                    [receiver_id, sender_id, sender_id, receiver_id], 
                    (err, row) => resolve(!!row)
                );
            });
            
            if (isBlocked) {
                return reply.code(403).send({ 
                    success: false, 
                    message: "You cannot send messages to this user." 
                });
            }

            // 2. If not blocked, proceed to save message
            const id = await saveMessage(sender_id, receiver_id, content);
            reply.code(201).send({ success: true, message_id: id });

        } catch(error: any) {
            console.error("❌ Error in message flow:", error);
            reply.code(500).send({ success: false, error: error.message });
        }
    });

    Server.instance().get("/message/history", async(req, reply) => {
        const { sender_id, receiver_id } = req.query as Historyquery;
        try {
            const messages = await getMessages(Number(sender_id), Number(receiver_id));
            reply.code(200).send(messages);
        } catch(error: any) {
            reply.code(500).send({ success: false, error: error.message });
        }
    });
}