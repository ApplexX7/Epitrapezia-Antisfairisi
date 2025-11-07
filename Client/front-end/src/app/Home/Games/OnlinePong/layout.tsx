import "../../../globals.css";
import { NavBar } from '@/components/Navbar'
import LogoPong from "./LogoPong";
// import HomeNavBar from "./NavBar";



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <div className="custom-gradient h-screen w-full 
      flex flex-col items-center">
        <div className="flex flex-col  max-w-480 size-full">
          <LogoPong />
          {children}
        </div>
      </div>
  );
}