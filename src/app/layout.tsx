import type { Metadata } from "next";
import { Amiri, Literata, Source_Sans_3 } from "next/font/google";
import { SessionProvider } from "@/components/SessionProvider";
import { Navbar } from "@/components/Navbar";
import { Suspense } from "react";
import "./globals.css";

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

// Only used for the ك mark
const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: "700",
});

export const metadata: Metadata = {
  title: "Kajian Tracker",
  description:
    "Platform LMS pribadi untuk melacak progres belajar dari playlist kajian YouTube Ustadz Firanda Andirja dan ulama lainnya.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${literata.variable} ${sourceSans.variable} ${amiri.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
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
