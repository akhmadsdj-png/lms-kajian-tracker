import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignInButton } from "@/components/shell/SignInButton";
import { RequestForm } from "./RequestForm";

const statusLabel: Record<string, Record<string, { text: string; className: string }>> = {
  tutor: {
    pending: { text: "Menunggu dicek", className: "bg-raised text-pencil" },
    added: { text: "Sudah ditambahkan", className: "bg-pen-soft text-pen" },
    rejected: { text: "Tidak bisa ditambahkan", className: "bg-red-950/60 text-red-200" },
  },
  feature: {
    pending: { text: "Menunggu dibaca", className: "bg-raised text-pencil" },
    added: { text: "Sudah dikerjakan", className: "bg-pen-soft text-pen" },
    rejected: { text: "Belum bisa dikerjakan", className: "bg-red-950/60 text-red-200" },
  },
};

export default async function RequestTutorPage({
  searchParams,
}: {
  searchParams: Promise<{ jenis?: string }>;
}) {
  await connection();
  const initialType = (await searchParams).jenis === "saran" ? "feature" : "tutor";
  const session = await auth();
  const userId = session?.user?.id;

  const myRequests = userId
    ? await prisma.tutorRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { id: true, type: true, name: true, status: true, createdAt: true },
      })
    : [];


  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10">
      <h1 className="font-sans text-3xl font-bold sm:text-4xl">Request dan saran</h1>
      <p className="mt-2 max-w-2xl text-pencil">
        Ingin mengikuti kajian ustadz yang belum ada di sini? Kirim nama dan channel YouTube-nya, nanti playlist-nya
        ikut tersinkron setiap hari. Punya ide fitur atau menemukan yang kurang nyaman? Kirim juga lewat form ini.
      </p>

      <div className="mt-8 grid max-w-3xl gap-8">
        <div className="space-y-8">
          <section className="rounded-2xl bg-surface p-5 sm:p-6">
            {userId ? (
              <RequestForm initialType={initialType} />
            ) : (
              <div>
                <h2 className="font-sans text-lg font-bold">Masuk untuk mengirim request atau saran</h2>
                <p className="mt-1 text-pencil">Dicatat atas nama akunmu supaya kamu bisa melihat statusnya.</p>
                <SignInButton className="mt-4 rounded-full bg-ink px-5 py-2 font-bold text-paper hover:opacity-90">
                  Masuk dengan Google
                </SignInButton>
              </div>
            )}
          </section>

          {myRequests.length > 0 && (
            <section>
              <h2 className="mb-3 font-sans text-lg font-bold">Request dan saran kamu</h2>
              <ul className="divide-y divide-rule rounded-2xl bg-surface">
                {myRequests.map((r) => {
                  const labels = statusLabel[r.type] ?? statusLabel.tutor;
                  const status = labels[r.status] ?? labels.pending;
                  return (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-pen">{r.type === "feature" ? "Saran atau fitur" : "Pengajar"}</p>
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

      </div>
    </div>
  );
}
