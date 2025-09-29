"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/hooks/authProvider";
import LoadingComp from "@/components/loadingComp";

export default function LoginPageWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { accessToken, checkingAuth, refreshAuth } = useAuth();
  const [ready, setReady] = useState(false); // local state to know when refresh is done

  useEffect(() => {
    async function init() {
      await refreshAuth();
      setReady(true); // mark refresh attempt done
    }
    init();
  }, [refreshAuth]);

  useEffect(() => {
    if (ready && accessToken) {
      router.replace("/Home"); // redirect logged-in users
    }
  }, [ready, accessToken, router]);

  // While waiting for refresh, show loading
  if (!ready) return <LoadingComp />;

  // Show login page only if refresh is done and user is logged out
  if (!accessToken) return <>{children}</>;

  // fallback (optional)
  return null;
}
