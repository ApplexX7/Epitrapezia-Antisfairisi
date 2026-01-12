import { Server, Socket } from "socket.io";

export function registerChatSocket(io: Server, socket: Socket, onlineUsers: Record<number, Socket[]>) {
  socket.on("chat-message", (data: { to: number; text: string; message_id: number }) => {
    const user = (socket as any).user;
    const recipientSockets = onlineUsers[data.to] || [];

    const messageData = { 
      ...data, 
      from: user.id, 
      time: new Date().toISOString(),
      message_id: data.message_id
    };

    recipientSockets.forEach(s => s.emit("chat-message", messageData));
    socket.emit("chat-message", messageData);
  });

    //here add seknd socket the seen
  socket.on("messages-seen", (data: { to: number; message_ids: number[] }) => {
    const recipientSockets = onlineUsers[data.to] || [];
    
    recipientSockets.forEach(s => {
      s.emit("messages-seen", {
        message_ids: data.message_ids
      });
    });
  });
}