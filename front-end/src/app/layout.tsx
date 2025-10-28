import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import AuthWrapper from "@/components/AuthCheck";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500" , "600" ,"700"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Ping Pong Game",
  description: "Fun and competitive ping pong experience!",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} antialiased`}>
      <AuthWrapper>
          {children}
          <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#fff',
              color: '#333',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
              fontWeight: '500',
            },
            success: {
              iconTheme: { primary: '#4ade80', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        </AuthWrapper>
      </body>
    </html>
  );
}