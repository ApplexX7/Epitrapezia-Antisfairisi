import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import AuthWrapper from "@/components/AuthCheck";
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
        </AuthWrapper>
      </body>
    </html>
  );
}