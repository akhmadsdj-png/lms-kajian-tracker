"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-rule bg-paper">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href={session ? "/dashboard" : "/"}
          className="flex items-baseline gap-2.5"
        >
          <span className="font-arabic text-2xl leading-none text-pen" aria-hidden>
            ك
          </span>
          <span className="font-serif text-lg font-semibold">Kajian Tracker</span>
        </Link>

        {session?.user ? (
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 sm:flex">
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt=""
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              )}
              <span className="text-sm text-pencil">{session.user.name}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm text-pencil underline-offset-4 hover:text-ink hover:underline"
            >
              Keluar
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="rounded-md bg-pen px-3.5 py-1.5 text-sm font-semibold text-paper hover:opacity-90"
          >
            Masuk
          </button>
        )}
      </div>
    </nav>
  );
}
