import "../globals.css";
import Link from "next/link";
import Image from "next/image";
import { NavBar } from '@/components/Navbar'
import HomeNavBar from "@/components/HomeNavBar";



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
