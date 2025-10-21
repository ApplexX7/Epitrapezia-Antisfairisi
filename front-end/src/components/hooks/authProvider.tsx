import { create } from "zustand";
import api from "@/lib/axios";

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
  isFriend ?: boolean,
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
    checkingAuth: true, // start as "checking"
    setAuth: (user, token) => set({ user, accessToken: token, checkingAuth: false }),
    clearAuth: () => set({ user: null, accessToken: null, checkingAuth: false }),
    refreshAuth: async () => {
      if (refreshPromise) return refreshPromise; // avoid multiple calls
      refreshPromise = (async () => {
        try {
          const res = await api.get("/auth/refresh");
          if (res.data?.token?.accessToken && res.data.user) {
            set({ user: res.data.user, accessToken: res.data.token.accessToken, checkingAuth: false });
          } else {
            set({ user: null, accessToken: null, checkingAuth: false });
          }
        } catch {
          set({ user: null, accessToken: null, checkingAuth: false });
        } finally {
          refreshPromise = null; // reset
        }
      })();
      return refreshPromise;
    },
  };
});
