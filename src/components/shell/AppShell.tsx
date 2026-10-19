"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { AccountMenu } from "./AccountMenu";
import { SearchBox } from "./SearchBox";
import { CloseIcon, HeartIcon, MenuIcon, SearchIcon } from "./icons";

const COLLAPSED_KEY = "sidebar-collapsed";

interface AppShellProps {
  /** Full sidebar (server-rendered) */
  sidebar: React.ReactNode;
  /** Icon-only rail shown when the sidebar is collapsed on desktop */
  rail: React.ReactNode;
  children: React.ReactNode;
}

/**
 * YouTube-style frame: top bar with search, a left sidebar that collapses to an
 * icon rail on desktop, and a slide-in drawer on mobile and on watch pages.
 */
export function AppShell({ sidebar, rail, children }: AppShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const collapsed = useSyncExternalStore(subscribeCollapsed, readCollapsed, () => false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Watch pages and the landing page give the content full width; the sidebar becomes a drawer.
  const segments = pathname.split("/").filter(Boolean);
  const drawerOnly = pathname === "/" || (segments.length === 3 && segments[0] !== "search");

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  function toggleMenu() {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (isDesktop && !drawerOnly) {
      writeCollapsed(!collapsed);
    } else {
      setDrawerOpen((o) => !o);
    }
  }

  // Close the drawer as soon as a link inside it is followed
  function closeOnLink(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("a")) setDrawerOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center gap-2 bg-paper/90 px-2 backdrop-blur-xl sm:gap-4 sm:px-4">
        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={toggleMenu}
            aria-label="Menu"
            aria-expanded={drawerOnly ? drawerOpen : !collapsed}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-raised"
          >
            <MenuIcon />
          </button>
          <Logo />
        </div>

        <div className="mx-auto hidden w-full max-w-xl md:block">
          <SearchBox />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
          <Link
            href="/search"
            aria-label="Cari"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-raised md:hidden"
          >
            <SearchIcon />
          </Link>
          <Link
            href="/request-pengajar#donasi"
            aria-label="Donasi"
            className="flex h-9 items-center gap-1.5 rounded-full px-2 text-sm font-semibold hover:bg-raised sm:bg-raised sm:px-3.5 sm:hover:bg-rule"
          >
            <HeartIcon className="h-5 w-5 text-[#ff8fa3]" />
            <span className="hidden sm:inline">Donasi</span>
          </Link>
          {session?.user ? (
            <AccountMenu name={session.user.name} email={session.user.email} image={session.user.image} />
          ) : (
            <button
              onClick={() => signIn("google")}
              className="h-9 rounded-full border border-rule px-4 text-sm font-semibold text-pen hover:bg-pen-soft"
            >
              Masuk
            </button>
          )}
        </div>
      </header>

      <div className="flex">
        {!drawerOnly && (
          <aside
            className={`no-scrollbar sticky top-14 hidden h-[calc(100dvh-3.5rem)] shrink-0 overflow-y-auto lg:block ${
              collapsed ? "w-[76px]" : "w-64"
            }`}
            aria-label="Navigasi utama"
          >
            {collapsed ? rail : sidebar}
          </aside>
        )}

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            className="absolute inset-0 bg-black/60"
            aria-label="Tutup menu"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className="no-scrollbar absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-paper shadow-2xl"
            onClick={closeOnLink}
          >
            <div className="flex h-14 items-center gap-1 px-2 sm:px-4">
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Tutup menu"
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-raised"
              >
                <CloseIcon />
              </button>
              <Logo />
            </div>
            {sidebar}
          </div>
        </div>
      )}
    </>
  );
}

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 px-1">
      {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG */}
      <img src="/logo.svg" alt="" width={24} height={24} className="h-7 w-7 shrink-0" />
      <span className="hidden font-serif text-lg font-semibold min-[400px]:inline">Kajian Tracker</span>
    </Link>
  );
}

// Desktop collapse preference lives in localStorage; read it without a hydration mismatch.
const COLLAPSED_EVENT = "sidebar-collapsed-change";

function subscribeCollapsed(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(COLLAPSED_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(COLLAPSED_EVENT, onChange);
  };
}

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

function writeCollapsed(value: boolean) {
  try {
    localStorage.setItem(COLLAPSED_KEY, value ? "1" : "0");
  } catch {}
  window.dispatchEvent(new Event(COLLAPSED_EVENT));
}
