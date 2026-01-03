import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useSocketStore } from "./SocketIOproviders";

export type User = {
  id: number;
  firstName?: string;
  lastName?: string;
  username: string;
  email?: string;
  avatar: string;
  des?: string,
  bio?: string,
  github?: string,
  instagram?: string,
  dateJoined?: string,
  exp?: number,
  level?: number;
  progression?: number;
  twoFactorEnabled?: boolean;
  isFriend?: boolean,
  friendstatus?: string,
  isOnline?: boolean,
};

type AuthState = {
  user: User | null;
  accessToken: string | null;
  checkingAuth: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (updates: Partial<User>) => void;
  clearAuth: () => void;
  refreshAuth: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => {
  let refreshPromise: Promise<void> | null = null;

  return {
    user: null,
    accessToken: null,
    checkingAuth: true, 
    setAuth: (user, token) => set({ user, accessToken: token, checkingAuth: false }),
    updateUser: (updates) => set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null
    })),
    clearAuth: () =>{ 
      set({ user: null, accessToken: null, checkingAuth: false })
    },
    refreshAuth: async () => {
      if (refreshPromise) return refreshPromise;
      refreshPromise = (async () => {
        try {
          const res = await api.get("/auth/refresh");
          if (res.data?.token?.accessToken && res.data.user) {
            const initSocket = useSocketStore.getState().initSocket;
            const disconnectSocket = useSocketStore.getState().disconnectSocket;
            // Disconnect existing socket if any
            disconnectSocket();
            set({ user: res.data.user, accessToken: res.data.token.accessToken, checkingAuth: false });
            // Initialize new socket with fresh token
            initSocket(res.data.user, res.data.token.accessToken);
          } else {
            toast.error("Session expired. Please sign in again ⚠️");
            set({ user: null, accessToken: null, checkingAuth: false });
          }
        } catch {
          set({ user: null, accessToken: null, checkingAuth: false });
        } finally {
          refreshPromise = null;
        }
      })();
      return refreshPromise;
    },
  };
});
