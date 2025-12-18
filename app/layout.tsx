import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arc Raiders Guide - Your Complete Survival Companion",
  description: "Comprehensive guide to Arc Raiders featuring raiders, maps, items, and the latest news and strategies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          background: 'radial-gradient(ellipse at top, hsl(0 0% 12%) 0%, var(--background) 55%, hsl(0 0% 4%) 100%)',
          color: 'var(--foreground)',
          minHeight: '100vh'
        }}
      >
        <Navbar />
        <Sidebar />
        <main className="ml-14 mt-14">
          {children}
        </main>
      </body>
    </html>
  );
}
