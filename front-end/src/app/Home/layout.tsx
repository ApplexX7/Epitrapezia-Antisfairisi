"use client";
import "../globals.css";
import HomeNavBar from "@/components/HomeNavBar";
import AuthWrapper from "@/components/AuthCheck";

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
  );
}
