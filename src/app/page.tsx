import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginButton } from "@/components/LoginButton";
import Link from "next/link";
import { boxClass } from "@/components/MutabaahGrid";
import { connection } from "next/server";

export default async function HomePage() {
  await connection();
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="max-w-3xl">
        <h1 className="text-4xl leading-tight sm:text-5xl">
          Ikuti kajian YouTube pertemuan demi pertemuan.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-pencil">
          Playlist kajian disusun berurutan. Posisi tonton terakhir tersimpan, dan setiap
          pertemuan yang selesai tercentang di kartu mutaba&apos;ah.
        </p>

        {/* Sample card: 40 pertemuan, 12 selesai, 1 belum tuntas */}
        <div className="my-10" aria-hidden>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5">
            {[0, 10, 20, 30].map((start) => (
              <div key={start} className="flex gap-1">
                {Array.from({ length: 10 }, (_, j) => {
                  const i = start + j;
                  const status = i < 12 ? "completed" : i === 12 ? "in-progress" : "unwatched";
                  return <span key={i} className={`h-5 w-5 rounded-[3px] border ${boxClass[status]}`} />;
                })}
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-pencil">12 dari 40 pertemuan selesai</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <LoginButton />
          <Link href="/dashboard" className="text-pen underline-offset-4 hover:underline">
            Lihat daftar kajian tanpa masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
