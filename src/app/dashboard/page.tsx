import { auth } from "@/lib/auth";
import Link from "next/link";
import { LoginBanner } from "@/components/LoginBanner";
import { Avatar } from "@/components/media/Avatar";
import { Backdrop } from "@/components/media/Backdrop";
import { PlaylistTile } from "@/components/media/PlaylistTile";
import { Shelf } from "@/components/media/Shelf";
import { PlayIcon } from "@/components/media/PlayIcon";
import { ProgressSummary, type ProgressStats } from "@/components/media/ProgressSummary";
import { Thumb } from "@/components/media/Thumb";
import { VideoTile } from "@/components/media/VideoTile";
import {
  getContinueWatching,
  getDashboardTutors,
  getDashboardUserProgress,
} from "@/lib/queries";
import { displayTitle, formatTime } from "@/lib/format";
import { upsizeThumb, videoThumb } from "@/lib/youtube";
import { CATEGORY_ORDER, categorize } from "@/lib/categories";
import { connection } from "next/server";

export default async function DashboardPage() {
  await connection();
  const session = await auth();
  const userId = session?.user?.id;

  const [tutors, progressRows, resumeList] = await Promise.all([
    getDashboardTutors(),
    userId ? getDashboardUserProgress(userId) : Promise.resolve([]),
    userId ? getContinueWatching(userId) : Promise.resolve([]),
  ]);

  const completedByPlaylist = new Map<string, number>();
  const lastActivityByPlaylist = new Map<string, number>();
  let secondsWatched = 0;
  let inProgress = 0;
  for (const r of progressRows) {
    const id = r.video.playlistId;
    const at = new Date(r.updatedAt).getTime();
    lastActivityByPlaylist.set(id, Math.max(lastActivityByPlaylist.get(id) ?? 0, at));
    if (r.isCompleted) {
      completedByPlaylist.set(id, (completedByPlaylist.get(id) ?? 0) + 1);
      secondsWatched += r.video.durationSeconds ?? r.lastWatchedSeconds;
    } else {
      secondsWatched += r.lastWatchedSeconds;
      if (r.lastWatchedSeconds > 0) inProgress++;
    }
  }

  const allPlaylists = tutors.flatMap((t) =>
    t.playlists.map((p) => ({ ...p, tutorName: t.name, tutorSlug: t.slug })),
  );

  const shelves = new Map<string, typeof allPlaylists>();
  for (const p of allPlaylists) {
    const name = categorize(p.title);
    shelves.set(name, [...(shelves.get(name) ?? []), p]);
  }

  const featured = pickDailyFeatured(allPlaylists);

  const followed = allPlaylists
    .filter((p) => lastActivityByPlaylist.has(p.id))
    .sort((a, b) => lastActivityByPlaylist.get(b.id)! - lastActivityByPlaylist.get(a.id)!);

  const stats: ProgressStats | null = userId
    ? {
        completed: [...completedByPlaylist.values()].reduce((n, c) => n + c, 0),
        inProgress,
        secondsWatched,
        playlistsFollowed: followed.length,
        followedTotal: followed.reduce((n, p) => n + p._count.videos, 0),
      }
    : null;

  const resume = resumeList[0];

  // Hero: the video you were watching, otherwise the first playlist
  const hero = resume
    ? {
        href: `/${resume.video.playlist.tutor.slug}/${resume.video.playlist.slug}/${resume.video.id}`,
        art: videoThumb(resume.video.youtubeVideoId, "hq"),
        kicker: "Lanjutkan menonton",
        title: displayTitle(resume.video.title),
        meta: `Pertemuan ${resume.video.orderIndex} dari ${resume.video.playlist._count.videos}, ${resume.video.playlist.title}`,
        cta: `Lanjutkan dari ${formatTime(resume.lastWatchedSeconds)}`,
        durationSeconds: resume.video.durationSeconds,
        watchedSeconds: resume.lastWatchedSeconds,
      }
    : featured
      ? {
          href: `/${featured.tutorSlug}/${featured.slug}`,
          art: upsizeThumb(featured.thumbnailUrl),
          kicker: featured.tutorName,
          title: featured.title,
          meta: `${featured._count.videos} pertemuan`,
          cta: "Mulai menonton",
          durationSeconds: null,
          watchedSeconds: 0,
        }
      : null;

  return (
    <>
      {!session?.user && <LoginBanner />}

      {hero && (
        <section className="relative isolate">
          <Backdrop src={hero.art} />
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pt-8 pb-6 sm:px-6 sm:pt-14 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-12">
            <Link href={hero.href} className="group relative block" tabIndex={-1} aria-hidden>
              <Thumb
                src={hero.art}
                durationSeconds={hero.durationSeconds}
                watchedSeconds={hero.watchedSeconds}
                sizes="(min-width: 768px) 640px, 100vw"
                priority
                className="rounded-xl shadow-2xl shadow-black/60"
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition-transform group-hover:scale-110">
                  <PlayIcon className="ml-1 h-7 w-7" />
                </span>
              </span>
            </Link>

            <div>
              <p className="font-semibold text-pen">{hero.kicker}</p>
              <h1 className="mt-2 text-3xl leading-tight sm:text-4xl lg:text-5xl">{hero.title}</h1>
              <p className="mt-3 text-pencil">{hero.meta}</p>
              <Link
                href={hero.href}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-bold tabular-nums text-paper hover:opacity-90"
              >
                <PlayIcon className="h-5 w-5" />
                {hero.cta}
              </Link>
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <ProgressSummary stats={stats} />

        {resumeList.length > 1 && (
          <Shelf title="Lanjutkan menonton">
            {resumeList.map((r) => (
              <VideoTile
                key={r.video.id}
                href={`/${r.video.playlist.tutor.slug}/${r.video.playlist.slug}/${r.video.id}`}
                title={r.video.title}
                youtubeVideoId={r.video.youtubeVideoId}
                durationSeconds={r.video.durationSeconds}
                watchedSeconds={r.lastWatchedSeconds}
                meta={`Pertemuan ${r.video.orderIndex}, ${r.video.playlist.title}`}
              />
            ))}
          </Shelf>
        )}

        {followed.length > 0 && (
          <Shelf title="Playlist yang kamu ikuti">
            {followed.map((p) => (
              <PlaylistTile
                key={p.id}
                inShelf
                href={`/${p.tutorSlug}/${p.slug}`}
                title={p.title}
                thumbnailUrl={p.thumbnailUrl}
                totalVideos={p._count.videos}
                completedVideos={completedByPlaylist.get(p.id) ?? 0}
                subtitle="Baru dimulai"
              />
            ))}
          </Shelf>
        )}

        {CATEGORY_ORDER.filter((name) => shelves.has(name)).map((name) => (
          <Shelf key={name} title={name}>
            {shelves.get(name)!.map((p) => (
              <PlaylistTile
                key={p.id}
                inShelf
                href={`/${p.tutorSlug}/${p.slug}`}
                title={p.title}
                thumbnailUrl={p.thumbnailUrl}
                totalVideos={p._count.videos}
                completedVideos={completedByPlaylist.get(p.id) ?? 0}
                subtitle={p.tutorName}
              />
            ))}
          </Shelf>
        ))}

        <Shelf title="Pengajar">
          {tutors.map((tutor) => (
            <li key={tutor.id} className="w-36 shrink-0 snap-start">
              <Link href={`/${tutor.slug}`} className="group block text-center">
                <span className="mx-auto block w-fit rounded-full transition-transform group-hover:scale-105">
                  <Avatar src={tutor.imageUrl} name={tutor.name} size={128} />
                </span>
                <p className="mt-3 line-clamp-2 font-semibold leading-snug group-hover:text-pen">{tutor.name}</p>
                <p className="mt-0.5 text-sm text-pencil">
                  {tutor.playlists.length > 0 ? `${tutor.playlists.length} playlist` : "Segera hadir"}
                </p>
              </Link>
            </li>
          ))}
        </Shelf>
      </div>
    </>
  );
}

// Featured playlist rotates daily among the longer series
function pickDailyFeatured<T extends { _count: { videos: number } }>(playlists: T[]): T | undefined {
  const pool = playlists.filter((p) => p._count.videos >= 20);
  if (pool.length === 0) return playlists[0];
  const day = Math.floor(Date.now() / 86_400_000);
  return pool[day % pool.length];
}
