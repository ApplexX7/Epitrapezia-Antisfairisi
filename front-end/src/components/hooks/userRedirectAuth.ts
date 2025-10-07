"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./authProvider"
import api from "@/lib/axios";

export function userRediretionAuth() {
  const router = useRouter();
  const { accessToken, setAuth, refreshAuth } = useAuth();

  useEffect(() => {
    async function reload() {
      if (!accessToken) {
        await refreshAuth();
      }
      if (useAuth.getState().accessToken) {
        router.replace("/Home");
      }
    }
    reload();
  }, [accessToken, router, refreshAuth]);
}
