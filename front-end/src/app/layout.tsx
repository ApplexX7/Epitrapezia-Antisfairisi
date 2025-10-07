import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500" , "600" ,"700"],
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
          {children}
      </body>
    </html>
  );
}