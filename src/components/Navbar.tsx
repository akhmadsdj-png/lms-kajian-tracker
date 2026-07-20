"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href={session ? "/dashboard" : "/"}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-lg font-bold text-white shadow-lg shadow-emerald-500/20">
            ك
          </div>
          <span className="text-lg font-semibold text-white">
            Kajian Tracker
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 sm:flex">
                {session.user.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? "User"}
                    width={32}
                    height={32}
                    className="rounded-full ring-2 ring-emerald-500/30"
                  />
                )}
                <span className="text-sm font-medium text-slate-300">
                  {session.user.name}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-sm font-medium text-slate-400 transition-all hover:border-white/20 hover:text-white"
              >
                Keluar
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-1.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 hover:brightness-110"
            >
              Masuk
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
