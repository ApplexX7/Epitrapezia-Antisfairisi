import { io, Socket } from "socket.io-client";
import { create } from "zustand";
import { User } from "@/components/hooks/authProvider";

interface SocketStore {
  socket: Socket | null;
  isConnected: boolean;
  initSocket: (user: User, token: string) => void;
  disconnectSocket: () => void;
}

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  isConnected: false,

  initSocket: (user: User, token: string) => {
    if (get().socket) return; 

    const URL = process.env.NEXT_PUBLIC_BACKEND_URL || 
      (typeof window !== 'undefined' ? window.location.origin : "http://server:8080");
    
    console.log("🔌 Initializing socket with URL:", URL);
    console.log("👤 User:", user.username);
    
    const socket = io(URL, {
      path: "/socket/",
      transports: ["websocket"],
      auth: { token },
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
      set({ isConnected: true });
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
      set({ isConnected: false });
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
      set({ isConnected: false });
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },
}));
