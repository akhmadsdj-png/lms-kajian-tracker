"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <h1 className="font-sans text-3xl font-bold">Halaman ini gagal dimuat</h1>
      <p className="mt-3 text-pencil">
        Biasanya karena koneksi terputus sebentar. Coba muat ulang. Progres yang sudah tersimpan tidak hilang.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="rounded-full bg-ink px-5 py-2 font-bold text-paper hover:opacity-90"
        >
          Muat ulang
        </button>
        <Link href="/dashboard" className="rounded-full bg-raised px-5 py-2 font-bold hover:bg-rule">
          Ke beranda
        </Link>
      </div>
      {error.digest && <p className="mt-8 text-xs text-pencil">Kode error: {error.digest}</p>}
    </div>
  );
}
