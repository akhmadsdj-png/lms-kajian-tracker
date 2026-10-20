import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Literata, Source_Sans_3 } from "next/font/google";
import { SessionProvider } from "@/components/SessionProvider";
import { AppShell } from "@/components/shell/AppShell";
import { Rail } from "@/components/shell/Rail";
import { AdminRail, AdminSidebar } from "@/components/shell/AdminSidebar";
import { Sidebar, SidebarSkeleton } from "@/components/shell/Sidebar";
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

export const metadata: Metadata = {
  // Absolute base for share-preview image URLs
  metadataBase: new URL(process.env.AUTH_URL ?? "https://www.kajiantracker.com"),
  title: { default: "Kajian Tracker", template: "%s — Kajian Tracker" },
  description:
    "Ikuti kajian YouTube para ustadz sampai tuntas. Progres tiap pertemuan tercatat, dan kamu bisa lanjut dari menit terakhir. Gratis, tanpa iklan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${literata.variable} ${sourceSans.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Suspense fallback={null}>
          <SessionProvider>
            <AppShell
              sidebar={
                <Suspense fallback={<SidebarSkeleton />}>
                  <Sidebar />
                </Suspense>
              }
              rail={
                <Suspense fallback={null}>
                  <Rail />
                </Suspense>
              }
              adminSidebar={<AdminSidebar />}
              adminRail={<AdminRail />}
            >
              {children}
            </AppShell>
          </SessionProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
