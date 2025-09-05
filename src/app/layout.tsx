import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import MiniKitProvider from "@/providers/minikit-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Photobooth - World Mini App",
  description: "Upload and store photos securely with World ID verification",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} antialiased`}
      >
        <MiniKitProvider>
          {children}
        </MiniKitProvider>
      </body>
    </html>
  );
}
