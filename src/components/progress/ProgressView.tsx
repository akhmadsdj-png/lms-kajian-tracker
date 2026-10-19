import Link from "next/link";
import {
  getDailyActivity,
  getDashboardTutors,
  getDashboardUserProgress,
  getPlaylistVideoLists,
} from "@/lib/queries";
import { followedPlaylists, pickNextVideo, summarizeProgress } from "@/lib/library";
import { activityRange, buildWeeks, currentStreak, secondsThisWeek } from "@/lib/activity";
import { timeAgo } from "@/lib/format";
import type { VideoStatus } from "@/lib/progress-status";
import { ProgressBar } from "@/components/progress/ProgressBar";
import { ActivityGraph } from "@/components/progress/ActivityGraph";
import { PlaylistTile } from "@/components/media/PlaylistTile";
import { Thumb } from "@/components/media/Thumb";

interface ProgressViewProps {
  userId: string;
  /** Heading; defaults to the signed-in user's own wording */
  title?: string;
  /** Shown to admins viewing someone else's progress: hides "lanjutkan" calls to action */
  readOnly?: boolean;
}

/** Stats, activity graph and per-playlist cards for one user. Used by /progres and the admin user page. */
export async function ProgressView({ userId, title = "Progres belajar", readOnly = false }: ProgressViewProps) {
  const { today, start } = activityRange(16);
  const [tutors, progressRows, activity] = await Promise.all([
    getDashboardTutors(),
    getDashboardUserProgress(userId),
    getDailyActivity(userId, start),
  ]);

  const { completedByPlaylist, lastActivityByPlaylist, secondsWatched, inProgress } = summarizeProgress(progressRows);
  const playlists = tutors.flatMap((t) =>
    t.playlists.map((p) => ({ ...p, tutorName: t.name, tutorSlug: t.slug })),
  );
  const followed = followedPlaylists(playlists, lastActivityByPlaylist);
  const isFinished = (p: (typeof followed)[number]) =>
    p._count.videos > 0 && (completedByPlaylist.get(p.id) ?? 0) >= p._count.videos;
  const ongoing = followed.filter((p) => !isFinished(p));
  const finished = followed.filter(isFinished);

  // Per-video status for the mutaba'ah cards of the playlists still in progress
  const videoRows = await getPlaylistVideoLists(ongoing.map((p) => p.id));
  const progressByVideo = new Map(progressRows.map((r) => [r.videoId, r]));
  const videosByPlaylist = new Map<string, { id: string; title: string; orderIndex: number; status: VideoStatus }[]>();
  for (const v of videoRows) {
    const p = progressByVideo.get(v.id);
    const status: VideoStatus = p?.isCompleted ? "completed" : p && p.lastWatchedSeconds > 0 ? "in-progress" : "unwatched";
    videosByPlaylist.set(v.playlistId, [...(videosByPlaylist.get(v.playlistId) ?? []), { ...v, status }]);
  }

  const { weeks, byDay } = buildWeeks(start, today, activity);
  const streak = currentStreak(byDay, today);
  const minutesThisWeek = Math.round(secondsThisWeek(byDay, today) / 60);
  const totalCompleted = [...completedByPlaylist.values()].reduce((n, c) => n + c, 0);
  const hours = secondsWatched / 3600;

  const stats = [
    { label: "Pertemuan selesai", value: totalCompleted.toLocaleString("id-ID") },
    {
      label: "Jam belajar",
      value: hours >= 10 ? Math.round(hours).toLocaleString("id-ID") : hours.toLocaleString("id-ID", { maximumFractionDigits: 1 }),
    },
    { label: "Hari berturut-turut", value: `${streak}`, accent: streak > 0 },
    { label: "Playlist diikuti", value: followed.length.toLocaleString("id-ID") },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10">
      <h1 className="font-sans text-3xl font-bold sm:text-4xl">{title}</h1>
      <p className="mt-2 text-pencil">
        {readOnly
          ? `${inProgress} pertemuan belum tuntas.`
          : inProgress > 0
            ? `${inProgress} pertemuan belum tuntas. Lanjutkan dari posisi terakhirmu.`
            : "Semua catatan belajarmu ada di sini."}
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
      <dl className="grid grid-cols-2 gap-3 sm:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse rounded-2xl bg-surface p-5">
            <dt className="mt-1 text-sm text-pencil">{s.label}</dt>
            <dd className={`text-3xl font-bold tabular-nums sm:text-4xl ${s.accent ? "text-pen" : ""}`}>{s.value}</dd>
          </div>
        ))}
      </dl>

      <section className="rounded-2xl bg-surface p-5 sm:p-6" aria-labelledby="activity-heading">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 id="activity-heading" className="font-sans text-lg font-bold">
            Aktivitas 16 minggu terakhir
          </h2>
          <p className="text-sm tabular-nums text-pencil">{minutesThisWeek} menit minggu ini</p>
        </div>
        <ActivityGraph weeks={weeks} />
        {activity.length === 0 && (
          <p className="mt-3 max-w-[22rem] text-sm text-pencil">
            Grafik mulai terisi setiap kali kamu menonton kajian. Waktu yang dihitung hanya saat video benar-benar
            diputar.
          </p>
        )}
      </section>
      </div>

      {followed.length === 0 ? (
        <section className="mt-10 rounded-2xl border border-dashed border-rule p-8 text-center">
          <h2 className="font-sans text-xl font-bold">Belum ada kajian yang diikuti</h2>
          <p className="mt-2 text-pencil">Putar satu pertemuan, nanti playlist-nya muncul di sini lengkap dengan progresnya.</p>
          <Link
            href="/dashboard"
            className="mt-5 inline-block rounded-full bg-ink px-5 py-2 font-bold text-paper hover:opacity-90"
          >
            Pilih kajian di Beranda
          </Link>
        </section>
      ) : (
        <>
          {ongoing.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 font-sans text-xl font-bold">Sedang diikuti ({ongoing.length})</h2>
              <ul className="space-y-4">
                {ongoing.map((p) => {
                  const done = completedByPlaylist.get(p.id) ?? 0;
                  const videos = videosByPlaylist.get(p.id) ?? [];
                  const next = pickNextVideo(videos, (id) => {
                    const touched = progressByVideo.get(id)?.updatedAt;
                    return touched ? new Date(touched).getTime() : undefined;
                  });
                  const href = `/${p.tutorSlug}/${p.slug}`;
                  return (
                    <li key={p.id} className="rounded-2xl bg-surface p-4 sm:p-5">
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <Link href={href} className="shrink-0 sm:w-48" tabIndex={-1} aria-hidden>
                          <Thumb src={p.thumbnailUrl} badge={`${p._count.videos} pertemuan`} sizes="192px" />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link href={href} className="font-semibold leading-snug hover:text-pen">
                            {p.title}
                          </Link>
                          <p className="text-sm text-pencil">
                            {p.tutorName}, terakhir ditonton {timeAgo(new Date(lastActivityByPlaylist.get(p.id)!))}
                          </p>
                          <ProgressBar
                            className="mt-3"
                            completed={done}
                            inProgress={videos.filter((v) => v.status === "in-progress").length}
                            total={p._count.videos}
                          />
                          {next && !readOnly && (
                            <Link
                              href={`${href}/${next.id}`}
                              className="mt-3 inline-block rounded-full bg-pen px-4 py-1.5 text-sm font-bold text-paper hover:opacity-90"
                            >
                              {next.status === "in-progress"
                                ? `Lanjutkan pertemuan ${next.orderIndex}`
                                : `Mulai pertemuan ${next.orderIndex}`}
                            </Link>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {finished.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 font-sans text-xl font-bold">Sudah tamat ({finished.length})</h2>
              <div className="grid grid-cols-1 gap-x-5 gap-y-8 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {finished.map((p) => (
                  <PlaylistTile
                    key={p.id}
                    href={`/${p.tutorSlug}/${p.slug}`}
                    title={p.title}
                    thumbnailUrl={p.thumbnailUrl}
                    totalVideos={p._count.videos}
                    completedVideos={completedByPlaylist.get(p.id) ?? 0}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
