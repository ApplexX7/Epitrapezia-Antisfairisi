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
      setInitialized(true); // mark refresh attempt done
    }
    init();
  }, [refreshAuth]);

  useEffect(() => {
    if (initialized && accessToken) {
      router.replace("/Home");
    }
  }, [initialized, accessToken, router]);

  if (initialized){
    return <LoadingComp />;
  }
  return <>{children}</>;
}
