import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "@/components/SessionProvider";
import { Navbar } from "@/components/Navbar";
import { Suspense } from "react";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kajian Tracker — Lacak Progress Kajian Islam",
  description:
    "Platform LMS pribadi untuk melacak progres belajar dari playlist kajian YouTube Ustadz Firanda Andirja dan ulama lainnya.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-inter)]">
        <Suspense>
          <SessionProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
          </SessionProvider>
        </Suspense>
      </body>
    </html>
  );
}
