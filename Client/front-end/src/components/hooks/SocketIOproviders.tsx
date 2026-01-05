'use client'
import { io, Socket } from "socket.io-client";
import { create } from "zustand";
import { User } from "@/components/hooks/authProvider";
import { toast } from "sonner";

export interface Notification {
  id: string;
  type: string;
  message: string;
  from?: { id: string; username: string };
  time: string;
  read: boolean;
  payload?: any;
}

export type MatchedPayload = {
  opponent: {
    id: number;
    username: string;
    avatar: string;
  };
  roomId: string;
  role: "left" | "right";
};

interface SocketStore {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  lastMatched: MatchedPayload | null;
  initSocket: (user: User, token: string) => void;
  disconnectSocket: () => void;
  addNotification: (notif: Notification) => void;
  removeNotification: (fromUserId: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setLastMatched: (payload: MatchedPayload) => void;
  clearLastMatched: () => void;
  clearNotifications: () => void;
}

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  isConnected: false,
  notifications: [],
  lastMatched: null,

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

    // Incoming notifications from server
    socket.on("notification", (notif: any) => {
      // Handle friend request cancellation by removing the pending notification
      if (notif.type === "friend-request-cancelled" && notif.from?.id) {
        get().removeNotification(String(notif.from.id));
        return;
      }

      const newNotif: Notification = {
        id: notif.id || `${notif.type}-${Date.now()}`,
        type: notif.type,
        message: notif.message || "",
        from: notif.from,
        time: notif.time || new Date().toISOString(),
        read: false,
        payload: notif.payload,
      };

      // Store in Zustand
      get().addNotification(newNotif);

      // Trigger toast
      toast(
        notif.type === "friend-request"
          ? `📨 New friend request from ${notif.from?.username}`
          : notif.message
      );
    });

    // Cache latest match payload so pages can consume it even if mounted late
    socket.on("matched", (payload: MatchedPayload) => {
      set({ lastMatched: payload });
    });

    // Legacy friend request event
    socket.on("friend:request", (payload: any) => {
      const newNotif: Notification = {
        id: `friend-request-${payload?.from?.id}-${Date.now()}`,
        type: "friend-request",
        message: payload?.message || "You have a new friend request",
        from: payload?.from,
        time: new Date().toISOString(),
        read: false,
      };

      get().addNotification(newNotif);
      toast(`📨 New friend request from ${payload?.from?.username || "Unknown"}`);
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

  addNotification: (notif: Notification) =>
    set((state) => ({
      notifications: [notif, ...state.notifications],
    })),

  removeNotification: (fromUserId: string) =>
    set((state) => ({
      notifications: state.notifications.filter(
        (n) => n.type !== "friend-request" || n.from?.id !== fromUserId
      ),
    })),
  setLastMatched: (payload: MatchedPayload) => set({ lastMatched: payload }),
  clearLastMatched: () => set({ lastMatched: null }),
  markAsRead: (id: string) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  clearNotifications: () => set({ notifications: [] }),
}));
