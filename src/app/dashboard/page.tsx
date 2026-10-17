import { auth } from "@/lib/auth";
import Link from "next/link";
import { LoginBanner } from "@/components/LoginBanner";
import {
  getContinueWatching,
  getDashboardTutors,
  getDashboardUserProgress,
} from "@/lib/queries";
import { displayTitle, formatTime } from "@/lib/format";
import { connection } from "next/server";

export default async function DashboardPage() {
  await connection();
  const session = await auth();
  const userId = session?.user?.id;

  const [tutors, progressRows, resume] = await Promise.all([
    getDashboardTutors(),
    userId ? getDashboardUserProgress(userId) : Promise.resolve([]),
    userId ? getContinueWatching(userId) : Promise.resolve(null),
  ]);

  const completedByTutor = new Map<string, number>();
  for (const r of progressRows) {
    if (!r.isCompleted) continue;
    const tutorId = r.video.playlist.tutorId;
    completedByTutor.set(tutorId, (completedByTutor.get(tutorId) ?? 0) + 1);
  }

  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <>
      {!session?.user && <LoginBanner />}

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        {resume ? (
          <section className="mb-14 max-w-2xl border-l-4 border-pen pl-5">
            <p className="text-pencil">Terakhir kamu tonton</p>
            <h1 className="mt-1 text-2xl sm:text-3xl">{displayTitle(resume.video.title)}</h1>
            <p className="mt-2 text-pencil">
              Pertemuan {resume.video.orderIndex} dari {resume.video.playlist._count.videos},{" "}
              {resume.video.playlist.title}, {resume.video.playlist.tutor.name}
            </p>
            <Link
              href={`/${resume.video.playlist.tutor.slug}/${resume.video.playlist.slug}/${resume.video.id}`}
              className="mt-5 inline-block rounded-md bg-pen px-4 py-2 font-semibold tabular-nums text-paper hover:opacity-90"
            >
              Lanjutkan dari {formatTime(resume.lastWatchedSeconds)}
            </Link>
          </section>
        ) : (
          <section className="mb-14 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl">
              {firstName ? `Assalamu'alaikum, ${firstName}` : "Pilih kajian"}
            </h1>
            <p className="mt-2 text-pencil">
              {userId
                ? "Pilih pengajar dan playlist untuk mulai. Posisi tonton tersimpan otomatis."
                : "Masuk untuk menyimpan posisi tonton dan menandai pertemuan yang sudah selesai."}
            </p>
          </section>
        )}

        <h2 className="mb-2 text-xl">Pengajar</h2>
        <ul className="border-t border-rule">
          {tutors.map((tutor) => {
            const total = tutor.playlists.reduce((n, p) => n + p._count.videos, 0);
            const completed = completedByTutor.get(tutor.id) ?? 0;

            return (
              <li key={tutor.id}>
                <Link
                  href={`/${tutor.slug}`}
                  className="flex flex-col gap-0.5 border-b border-rule px-2 py-4 hover:bg-surface sm:flex-row sm:items-baseline sm:justify-between"
                >
                  <span className="font-serif text-lg font-semibold">{tutor.name}</span>
                  <span className="text-sm tabular-nums text-pencil">
                    {tutor.playlists.length === 0
                      ? "Belum ada playlist"
                      : `${tutor.playlists.length} playlist, ${total.toLocaleString("id-ID")} pertemuan`}
                    {userId && completed > 0 && `, ${completed} selesai`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
