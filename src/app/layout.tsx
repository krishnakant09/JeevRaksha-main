import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pashu Rakshak (पशु रक्षक) – AI Livestock Health & Early Warning",
  description:
    "AI-powered animal health surveillance and rapid veterinary response system for farmers and veterinarians.",
};

import ChatFAB from "@/components/ChatFAB";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable} style={{ colorScheme: "light" }}>
      <body className="min-h-full antialiased">
        {children}
        <ChatFAB />
      </body>
    </html>
  );
}
