import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginButton } from "@/components/LoginButton";
import Link from "next/link";
import { getDashboardTutors } from "@/lib/queries";
import { upsizeThumb } from "@/lib/youtube";
import { connection } from "next/server";

export default async function HomePage() {
  await connection();
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  const tutors = await getDashboardTutors();
  // Take covers round-robin across tutors so the wall shows every pengajar,
  // not just the first one's 24 playlists
  const perTutor = tutors.map((t) =>
    t.playlists.map((p) => upsizeThumb(p.thumbnailUrl)).filter((url): url is string => Boolean(url)),
  );
  const covers: string[] = [];
  for (let i = 0; covers.length < 24 && perTutor.some((list) => i < list.length); i++) {
    for (const list of perTutor) if (i < list.length && covers.length < 24) covers.push(list[i]);
  }
  const playlistCount = tutors.reduce((n, t) => n + t.playlists.length, 0);
  const tutorCount = tutors.filter((t) => t.playlists.length > 0).length;

  return (
    <div className="relative isolate flex min-h-[calc(100svh-3.5rem)] items-end overflow-hidden">
      {/* Wall of real playlist artwork, tilted like a TV app home screen */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -top-24 left-1/2 grid w-[1600px] -translate-x-1/2 -rotate-6 grid-cols-6 gap-3 opacity-70">
          {covers.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- decorative backdrop
            <img key={i} src={src} alt="" className="aspect-video w-full rounded-lg object-cover" />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/85 to-paper/20" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 pt-40 pb-16 sm:px-6 sm:pb-24">
        <div className="max-w-2xl">
          <h1 className="text-4xl leading-tight sm:text-6xl">
            Ikuti kajian YouTube pertemuan demi pertemuan.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-pencil">
            {playlistCount.toLocaleString("id-ID")} playlist kajian dari {tutorCount} pengajar, tersusun berurutan. Posisi tonton tersimpan, dan setiap
            pertemuan yang selesai tercentang.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <LoginButton />
            <Link href="/dashboard" className="font-semibold text-ink underline-offset-4 hover:underline">
              Lihat kajian tanpa masuk
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
