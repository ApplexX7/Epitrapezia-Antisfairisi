"use client";
import "../globals.css";
import HomeNavBar from "@/components/HomeNavBar";
import api from "@/lib/axios";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <div className="custom-gradient h-screen w-full
      flex flex-col items-center">
        <div className="flex flex-col  max-w-480 size-full">
          <HomeNavBar />
          {children}
        </div>
      </div>
  );
}
