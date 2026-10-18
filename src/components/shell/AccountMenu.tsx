"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

interface AccountMenuProps {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// Avatar button that opens a small account menu (YouTube-style), so "Keluar" is
// reachable on every screen size without crowding the top bar.
export function AccountMenu({ name, email, image }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const avatar = image ? (
    <Image src={image} alt="" width={32} height={32} className="rounded-full" />
  ) : (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pen font-bold text-paper">
      {name?.[0] ?? "?"}
    </span>
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu akun"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full hover:ring-2 hover:ring-rule"
      >
        {avatar}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-11 right-0 z-50 w-64 overflow-hidden rounded-xl border border-rule bg-surface shadow-2xl shadow-black/50"
        >
          <div className="flex items-center gap-3 border-b border-rule p-4">
            {avatar}
            <div className="min-w-0">
              <p className="truncate font-semibold">{name ?? "Akun"}</p>
              {email && <p className="truncate text-sm text-pencil">{email}</p>}
            </div>
          </div>
          <Link
            href="/request-pengajar?jenis=saran"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 hover:bg-raised"
          >
            Request dan saran
          </Link>
          <button
            role="menuitem"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="block w-full px-4 py-2.5 text-left hover:bg-raised"
          >
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}
