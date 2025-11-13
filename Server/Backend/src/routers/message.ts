// message.ts routes
import { Server } from "../server"
import { saveMessage } from "../controllers/saveMessage"
import { getMessages } from "../controllers/getMessages";

export function Message() {
    Server.instance().post("/message/send", async(req, reply) => {
        console.log("📨 POST /message/send called");
        console.log("Request body:", req.body);
        
        const {sender_id, receiver_id, content} = req.body as any;
        
        console.log("Parsed values:", { sender_id, receiver_id, content });
        
        try{
            const id = await saveMessage(sender_id, receiver_id, content);
            console.log("✅ Message saved with ID:", id);
            reply.code(201).send({ success: true, message_id: id});
        }catch(error: any){
            console.error("❌ Error saving message:", error);
            reply.code(500).send({ success: false, error: error.message});
        }
    });

    Server.instance().get("/message/history", async(req, reply) => {
        console.log("📖 GET /message/history called");
        console.log("Query params:", req.query);
        
        const {sender_id, receiver_id} = req.query as any;
        
        console.log("Parsed values:", { sender_id, receiver_id });
        
        try{
            const messages = await getMessages(Number(sender_id), Number(receiver_id));
            console.log("✅ Retrieved messages:", messages.length);
            reply.code(200).send(messages);
        }catch(error: any){
            console.error("❌ Error fetching messages:", error);
            reply.code(500).send({ success: false, error: error.message});
        }
    });
}
