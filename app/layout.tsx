import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { auth } from "@/lib/auth";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "دليل آرك رايدرز - رفيقك الكامل للبقاء",
  description: "دليل شامل لآرك رايدرز يتضمن المغيرين والخرائط والعناصر وآخر الأخبار والاستراتيجيات.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${cairo.variable} antialiased`}
        style={{
          background: 'radial-gradient(ellipse at top, oklch(0.24 0.03 50) 0%, var(--background) 50%, oklch(0.18 0.02 230) 100%)',
          color: 'var(--foreground)',
          minHeight: '100vh',
          fontFamily: 'var(--font-cairo)'
        }}
      >
        <Navbar session={session} />
        <Sidebar />
        <main className="mr-14 mt-14">
          {children}
        </main>
      </body>
    </html>
  );
}
