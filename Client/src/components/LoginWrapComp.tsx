"use client";

import { useEffect} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/hooks/authProvider";
import LoadingComp from "@/components/loadingComp";

export default function LoginPageWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { accessToken, checkingAuth, refreshAuth } = useAuth();

  useEffect(() => {
    async function init() {
      await refreshAuth();
    }
    init();
  }, [refreshAuth]);

  useEffect(() => {
    if (!checkingAuth && accessToken) {
      router.replace("/Home");
    }
  }, [checkingAuth, accessToken, router]);

  if (checkingAuth || accessToken) {
    return <LoadingComp />;
  }
  return <>{children}</>;
}
