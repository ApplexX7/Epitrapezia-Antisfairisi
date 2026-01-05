"use client"
import "../globals.css";
import { useEffect } from "react";
import { useRouter , usePathname} from "next/navigation";
import { useAuth } from "@/components/hooks/authProvider";
import LoadingComp from "@/components/loadingComp";
import AuthWrapper from "@/components/AuthCheck";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthWrapper>
      <div className="custom-gradient h-screen w-full 
      flex flex-col items-center">
        <div className="flex flex-col  overflow-y-auto scrollbar-hide max-w-480 size-full">
          {children}
        </div>
      </div>
    </AuthWrapper>
  );
}