import axios from "axios";
import { useAuth } from "@/components/hooks/authProvider";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuth.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config as any; 

    const isRefreshReq = originalRequest.url?.includes("/auth/refresh");

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshReq) {
      originalRequest._retry = true;
      try {
        await useAuth.getState().refreshAuth();
        const token = useAuth.getState().accessToken;
        if (!token) throw new Error("No token after refresh");
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch {
        useAuth.getState().clearAuth();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);


export default api;
