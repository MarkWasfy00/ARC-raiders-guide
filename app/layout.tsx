import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          background: 'radial-gradient(ellipse at top, oklch(0.24 0.03 50) 0%, var(--background) 50%, oklch(0.18 0.02 230) 100%)',
          color: 'var(--foreground)',
          minHeight: '100vh'
        }}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
