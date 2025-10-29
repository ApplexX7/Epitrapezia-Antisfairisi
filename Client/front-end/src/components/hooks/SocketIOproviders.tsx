import { io, Socket } from "socket.io-client";
import { create } from "zustand";
import { User } from "@/components/hooks/authProvider";

interface SocketStore {
  socket: Socket | null;
  isConnected: boolean;
  initSocket: (user: User) => void;
  disconnectSocket: () => void;
}

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  isConnected: false,

  initSocket: (user: User) => {
    if (get().socket) return;

    const newSocket = io("", {
      path: "/socket/",
      transports: ["websocket"],
      auth: { id: user.id, username: user.username },
    });

    newSocket.on("connect", () => {
      console.log("🟢 Socket connected:", newSocket.id);
      set({ isConnected: true });
    });

    newSocket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
      set({ isConnected: false });
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const s = get().socket;
    if (s) {
      s.disconnect();
      set({ socket: null, isConnected: false });
    }
  },
}));
