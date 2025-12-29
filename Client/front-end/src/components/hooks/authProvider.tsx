import { create } from "zustand";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { useSocketStore } from "./SocketIOproviders";

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar: string;
  des : string,
  dateJoined: string,
  exp: number,
  level: number;
  progression: number;
  isFriend ?: boolean,
  friendstatus ? : string,
};

type AuthState = {
  user: User | null;
  accessToken: string | null;
  checkingAuth: boolean;
  setAuth: (user: User, token: string) => void;
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
