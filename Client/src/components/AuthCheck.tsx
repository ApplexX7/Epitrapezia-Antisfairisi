"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/hooks/authProvider";
import LoadingComp from "@/components/loadingComp"

type AuthWrapperProps = {
  children: React.ReactNode;
};

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter();
  const { accessToken, checkingAuth, refreshAuth } = useAuth();
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    if (!checkingAuth && !accessToken) {
      router.replace("/");
    }
  }, [checkingAuth, accessToken, router]);

  if (checkingAuth) return <LoadingComp />;
  return <>{children}</>;
}
