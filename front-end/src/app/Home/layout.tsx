"use client";

import "../globals.css";
import { usePathname } from "next/navigation";
import HomeNavBar from "@/components/HomeNavBar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noLayoutRoutes = ["/Home/Games/LocalPong", "/Home/Games/OnlinePong"];

  if (noLayoutRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="custom-gradient h-screen w-full flex flex-col items-center">
      <div className="flex flex-col max-w-480 size-full">
        <HomeNavBar />
        {children}
      </div>
    </div>
  );
}
