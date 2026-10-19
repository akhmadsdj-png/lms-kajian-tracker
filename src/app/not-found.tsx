import Link from "next/link";

export const metadata = { title: "Halaman tidak ditemukan" };

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="font-sans text-6xl font-bold text-pen tabular-nums">404</p>
      <h1 className="mt-4 font-sans text-3xl font-bold">Halaman ini tidak ada</h1>
      <p className="mt-3 text-pencil">
        Mungkin link-nya salah ketik, atau playlist-nya sudah dipindah. Cari kajiannya lewat kotak pencarian di atas,
        atau telusuri dari daftar ustadz.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/search" className="rounded-full bg-ink px-5 py-2 font-bold text-paper hover:opacity-90">
          Telusuri kajian
        </Link>
        <Link href="/dashboard" className="rounded-full bg-raised px-5 py-2 font-bold hover:bg-rule">
          Ke beranda
        </Link>
      </div>
    </div>
  );
}
