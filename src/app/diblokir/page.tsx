import Link from "next/link";

export const metadata = { title: "Akun diblokir — Kajian Tracker" };

export default function BlockedPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <h1 className="font-sans text-3xl font-bold">Akun ini diblokir</h1>
      <p className="mt-3 text-pencil">
        Kamu tidak bisa masuk dengan akun Google ini. Kajian tetap bisa ditonton tanpa masuk, tapi progres tidak
        tersimpan. Kalau menurutmu ini keliru, hubungi admin lewat WhatsApp di halaman donasi.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/dashboard" className="rounded-full bg-ink px-5 py-2 font-bold text-paper hover:opacity-90">
          Lihat kajian tanpa masuk
        </Link>
        <Link href="/request-pengajar#donasi" className="rounded-full bg-raised px-5 py-2 font-bold hover:bg-rule">
          Hubungi admin
        </Link>
      </div>
    </div>
  );
}
