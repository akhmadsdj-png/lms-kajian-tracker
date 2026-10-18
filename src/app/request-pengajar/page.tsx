import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDonationInfo, whatsappLink } from "@/lib/donation";
import { SignInButton } from "@/components/shell/SignInButton";
import { CopyButton } from "./CopyButton";
import { RequestForm } from "./RequestForm";

const statusLabel: Record<string, { text: string; className: string }> = {
  pending: { text: "Menunggu dicek", className: "bg-raised text-pencil" },
  added: { text: "Sudah ditambahkan", className: "bg-pen-soft text-pen" },
  rejected: { text: "Tidak bisa ditambahkan", className: "bg-red-950/60 text-red-200" },
};

export default async function RequestTutorPage() {
  await connection();
  const session = await auth();
  const userId = session?.user?.id;

  const myRequests = userId
    ? await prisma.tutorRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, name: true, status: true, createdAt: true },
      })
    : [];

  const donation = getDonationInfo();
  const hasDonation = donation.accounts.length > 0 || donation.qr || donation.whatsapp;

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10">
      <h1 className="font-sans text-3xl font-bold sm:text-4xl">Request pengajar</h1>
      <p className="mt-2 max-w-2xl text-pencil">
        Ingin mengikuti kajian ustadz yang belum ada di sini? Kirim nama dan channel YouTube-nya. Admin akan
        mengecek lalu menambahkannya, dan playlist-nya ikut tersinkron setiap hari.
      </p>

      <div className={`mt-8 grid gap-8 ${hasDonation ? "lg:grid-cols-[minmax(0,1fr)_22rem]" : ""}`}>
        <div className="space-y-8">
          <section className="rounded-2xl bg-surface p-5 sm:p-6">
            {userId ? (
              <RequestForm />
            ) : (
              <div>
                <h2 className="font-sans text-lg font-bold">Masuk untuk mengirim request</h2>
                <p className="mt-1 text-pencil">Request dicatat atas nama akunmu supaya kamu bisa melihat statusnya.</p>
                <SignInButton className="mt-4 rounded-full bg-ink px-5 py-2 font-bold text-paper hover:opacity-90">
                  Masuk dengan Google
                </SignInButton>
              </div>
            )}
          </section>

          {myRequests.length > 0 && (
            <section>
              <h2 className="mb-3 font-sans text-lg font-bold">Request kamu</h2>
              <ul className="divide-y divide-rule rounded-2xl bg-surface">
                {myRequests.map((r) => {
                  const status = statusLabel[r.status] ?? statusLabel.pending;
                  return (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                      <div>
                        <p className="font-semibold">{r.name}</p>
                        <p className="text-sm text-pencil">
                          {new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-sm font-semibold ${status.className}`}>
                        {status.text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        {hasDonation && (
          <aside className="h-fit rounded-2xl bg-gradient-to-b from-pen-soft to-surface p-5 sm:p-6 lg:sticky lg:top-20">
            <h2 className="font-sans text-xl font-bold">Donasi seikhlasnya</h2>
            <p className="mt-2 text-pencil">
              Kajian Tracker gratis tanpa iklan. Donasi membantu biaya server dan sinkronisasi kajian setiap hari.
            </p>

            {donation.accounts.length > 0 && (
              <ul className="mt-5 space-y-3">
                {donation.accounts.map((a) => (
                  <li key={`${a.bank}-${a.number}`} className="rounded-xl bg-paper/60 p-4">
                    <p className="text-sm font-semibold text-pencil">{a.bank}</p>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className="font-sans text-xl font-bold tabular-nums tracking-wide">{a.number}</p>
                      <CopyButton value={a.number} />
                    </div>
                    {a.holder && <p className="mt-1 text-sm text-pencil">a.n. {a.holder}</p>}
                  </li>
                ))}
              </ul>
            )}

            {donation.qr && (
              <div className="mt-5 rounded-xl bg-paper/60 p-4 text-center">
                {donation.qr.label && <p className="mb-3 text-sm font-semibold text-pencil">{donation.qr.label}</p>}
                {/* eslint-disable-next-line @next/next/no-img-element -- QR may be hosted anywhere */}
                <img
                  src={donation.qr.image}
                  alt="Kode QR donasi Kajian Tracker"
                  className="mx-auto aspect-square w-full max-w-60 rounded-lg bg-white object-contain p-2"
                />
                {donation.qr.link && (
                  <a
                    href={donation.qr.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block rounded-full bg-raised px-4 py-1.5 text-sm font-semibold hover:bg-rule lg:hidden"
                  >
                    Buka di DANA
                  </a>
                )}
              </div>
            )}

            {donation.whatsapp && (
              <>
                <a
                  href={whatsappLink(
                    donation.whatsapp,
                    `Assalamu'alaikum, saya sudah berdonasi untuk Kajian Tracker${
                      session?.user?.name ? ` (atas nama ${session.user.name})` : ""
                    }. Berikut bukti transfernya:`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-bold text-[#0b1f12] hover:brightness-105"
                >
                  <WhatsAppIcon />
                  Kirim bukti donasi
                </a>
                <p className="mt-2 text-center text-xs text-pencil">Membuka WhatsApp dengan pesan yang sudah terisi.</p>
              </>
            )}
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
