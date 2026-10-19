import Link from "next/link";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { getDonationInfo, whatsappLink } from "@/lib/donation";
import { CopyButton } from "./CopyButton";

export const metadata = { title: "Donasi — Kajian Tracker" };

const THANKS: Record<string, string> = {
  pengajar: "Request pengajarmu terkirim. Admin akan mengecek channel-nya.",
  saran: "Saranmu terkirim. Admin akan membacanya.",
};

export default async function DonationPage({ searchParams }: { searchParams: Promise<{ terkirim?: string }> }) {
  await connection();
  const [session, { terkirim }] = await Promise.all([auth(), searchParams]);
  const donation = getDonationInfo();
  const thanks = terkirim ? THANKS[terkirim] : undefined;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10">
      {thanks && (
        <div role="status" className="mb-8 rounded-2xl bg-pen-soft px-5 py-4">
          <p className="font-semibold">Jazakallahu khairan. {thanks}</p>
          <p className="mt-1 text-sm text-pencil">
            Statusnya bisa dilihat di{" "}
            <Link href="/request-pengajar" className="font-semibold text-pen hover:underline">
              Request dan saran
            </Link>
            .
          </p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <section>
          <h1 className="font-sans text-3xl font-bold sm:text-4xl">Donasi seikhlasnya</h1>
          <p className="mt-3 max-w-xl text-pencil">
            Kajian Tracker gratis dan tidak memasang iklan. Donasi membantu biaya server, domain, dan sinkronisasi
            kajian dari YouTube setiap hari, supaya aplikasi ini tetap bisa dipakai siapa saja.
          </p>

          {donation.accounts.length > 0 && (
            <ul className="mt-6 max-w-md space-y-3">
              {donation.accounts.map((a) => (
                <li key={`${a.bank}-${a.number}`} className="rounded-xl bg-surface p-4">
                  <p className="text-sm font-semibold text-pencil">{a.bank}</p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="font-sans text-2xl font-bold tabular-nums tracking-wide">{a.number}</p>
                    <CopyButton value={a.number} />
                  </div>
                  {a.holder && <p className="mt-1 text-sm text-pencil">a.n. {a.holder}</p>}
                </li>
              ))}
            </ul>
          )}

          {donation.whatsapp && (
            <div className="mt-6 max-w-md">
              <a
                href={whatsappLink(
                  donation.whatsapp,
                  `Assalamu'alaikum, saya sudah berdonasi untuk Kajian Tracker${
                    session?.user?.name ? ` (atas nama ${session.user.name})` : ""
                  }. Berikut bukti transfernya:`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-bold text-[#0b1f12] hover:brightness-105"
              >
                <WhatsAppIcon />
                Kirim bukti donasi
              </a>
              <p className="mt-2 text-center text-xs text-pencil">Membuka WhatsApp dengan pesan yang sudah terisi.</p>
            </div>
          )}
        </section>

        {donation.qr && (
          <aside className="rounded-2xl bg-gradient-to-b from-pen-soft to-surface p-5 text-center sm:p-6 lg:sticky lg:top-20">
            {donation.qr.label && <p className="mb-3 text-sm font-semibold text-pencil">{donation.qr.label}</p>}
            <a href={donation.qr.image} target="_blank" rel="noopener noreferrer" title="Buka ukuran penuh">
              {/* eslint-disable-next-line @next/next/no-img-element -- QR may be hosted anywhere */}
              <img src={donation.qr.image} alt="Kode QRIS donasi Kajian Tracker" className="mx-auto w-full max-w-80 rounded-lg bg-white" />
            </a>
            <p className="mt-2 hidden text-xs text-pencil lg:block">Klik gambar untuk memperbesar.</p>
            {/* On a phone the QR can't be scanned from its own screen: save it, then scan from gallery */}
            <div className="mt-3 flex flex-wrap justify-center gap-2 lg:hidden">
              <a
                href={donation.qr.image}
                download="QRIS-Kajian-Tracker"
                className="rounded-full bg-raised px-4 py-1.5 text-sm font-semibold hover:bg-rule"
              >
                Simpan gambar QRIS
              </a>
              {donation.qr.link && (
                <a
                  href={donation.qr.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-raised px-4 py-1.5 text-sm font-semibold hover:bg-rule"
                >
                  Buka aplikasi pembayaran
                </a>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.03c-.24.68-1.42 1.3-1.95 1.34-.5.05-.97.23-3.27-.68-2.77-1.09-4.52-3.92-4.66-4.1-.13-.18-1.11-1.48-1.11-2.82s.7-2 .95-2.27c.25-.27.54-.34.72-.34h.52c.17 0 .4-.06.62.48.24.56.8 1.94.86 2.08.07.14.11.3.02.48-.09.18-.14.3-.27.46l-.41.48c-.14.14-.28.29-.12.56.16.27.71 1.17 1.52 1.9 1.05.93 1.93 1.22 2.2 1.36.27.14.43.11.59-.07.16-.18.68-.79.86-1.07.18-.27.36-.23.61-.14.25.09 1.58.75 1.85.88.27.14.45.2.52.32.06.11.06.66-.18 1.34Z" />
    </svg>
  );
}
