"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/hooks/authProvider";
import LoadingComp from "@/components/loadingComp";

export default function LoginPageWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { accessToken, checkingAuth, refreshAuth } = useAuth();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function init() {
      await refreshAuth();
      setInitialized(true); 
    }
    init();
  }, [refreshAuth]);

  useEffect(() => {
    if (!checkingAuth && accessToken) {
      router.replace("/Home");
    }
  }, [initialized, accessToken, router]);

  if (checkingAuth || accessToken) {
    return <LoadingComp />;
  }
  return <>{children}</>;
}
