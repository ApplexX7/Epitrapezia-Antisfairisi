"use client";
import HomeNavBar from "@/components/HomeNavBar";
import AuthWrapper from "@/components/AuthCheck";
import "../globals.css";
import { usePathname } from "next/navigation";
import  React from "react"


export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noLayoutRoutes = ["/Home/Games/LocalPong", "/Home/Games/OnlinePong"];

  if (noLayoutRoutes.includes(pathname)) {
    return <>{children}</>;
  }
  return (
    <AuthWrapper>
      <div className="custom-gradient h-screen w-full
      flex flex-col items-center  overflow-auto">
        <div className="flex flex-col max-w-480 size-full">
          <HomeNavBar />
          {children}
        </div>
      </div>
    </AuthWrapper>
    // <div className="custom-gradient h-screen w-full flex flex-col items-center">
    //   <div className="flex flex-col max-w-480 size-full">
    //     <HomeNavBar />
    //     {children}
    //   </div>
    // </div>
  );
}
