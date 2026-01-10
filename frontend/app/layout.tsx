import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Import the Navbar we created earlier
import { Navbar } from "@/components/layout/navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gacha Verse",
  description: "A modular Next.js Gacha base",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased min-h-screen bg-background font-sans`}
      >
        {/* The Navbar sits at the top of the body so it persists across all pages */}
        <Navbar />
        
        {/* Main wrapper content */}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}