"use client"
import "../globals.css";
import { useEffect } from "react";
import { useRouter , usePathname} from "next/navigation";
import { useAuth } from "@/components/hooks/authProvider";
import LoadingComp from "@/components/loadingComp";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname()
  const { accessToken, checkingAuth, refreshAuth } = useAuth();
  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);
  useEffect(() => {
    if (!checkingAuth && accessToken && pathname === "/login") {
      router.replace("/Home");
    }
  }, [checkingAuth, accessToken, router]);

  if (checkingAuth) return <LoadingComp />;
  return (
      <div className="custom-gradient h-screen w-full 
      flex flex-col items-center">
        <div className="flex flex-col  max-w-480 size-full">
          {children}
        </div>
      </div>
  );
}