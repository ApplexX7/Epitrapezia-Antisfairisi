import "../../../globals.css";
import LogoPong from "./LogoPong";



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