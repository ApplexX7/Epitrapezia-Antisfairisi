import { Server, Socket } from "socket.io";

export function registerChatSocket(io: Server, socket: Socket, onlineUsers: Record<number, Socket[]>) {
  socket.on("chat-message", (data: { to: number; text: string }) => {
    const user = (socket as any).user;
    const recipientSockets = onlineUsers[data.to] || [];

    const messageData = { ...data, from: user.id, time: new Date().toISOString() };

    recipientSockets.forEach(s => s.emit("chat-message", messageData));
    socket.emit("chat-message", messageData);
  });
}
