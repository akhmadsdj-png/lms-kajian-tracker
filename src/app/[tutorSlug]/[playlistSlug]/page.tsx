import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LoginBanner } from "@/components/LoginBanner";
import { MutabaahGrid, type VideoStatus } from "@/components/MutabaahGrid";
import { Avatar } from "@/components/media/Avatar";
import { Backdrop } from "@/components/media/Backdrop";
import { PlayIcon } from "@/components/media/PlayIcon";
import { Thumb } from "@/components/media/Thumb";
import { VideoRow } from "@/components/media/VideoRow";
import { getPlaylistPageData, getPlaylistProgress } from "@/lib/queries";
import { formatTotalDuration } from "@/lib/format";
import { upsizeThumb } from "@/lib/youtube";
import { connection } from "next/server";

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ tutorSlug: string; playlistSlug: string }>;
}) {
  await connection();
  const session = await auth();
  const userId = session?.user?.id;

  const { tutorSlug, playlistSlug } = await params;

  const playlist = await getPlaylistPageData(playlistSlug);
  if (!playlist || playlist.tutor.slug !== tutorSlug) notFound();

  const progressRows = userId ? await getPlaylistProgress(userId, playlist.id) : [];
  const progressMap = new Map(progressRows.map((r) => [r.videoId, r]));

  const videos = playlist.videos.map((v) => {
    const p = progressMap.get(v.id);
    const status: VideoStatus = p?.isCompleted
      ? "completed"
      : p && p.lastWatchedSeconds > 0
        ? "in-progress"
        : "unwatched";
    return { ...v, status, lastWatchedSeconds: p?.lastWatchedSeconds ?? 0 };
  });
  const completedCount = videos.filter((v) => v.status === "completed").length;
  const totalSeconds = videos.reduce((n, v) => n + (v.durationSeconds ?? 0), 0);
  const nextVideo = videos.find((v) => v.status !== "completed");
  const hrefBase = `/${tutorSlug}/${playlistSlug}`;
  const cover = upsizeThumb(playlist.thumbnailUrl);

  return (
    <>
      {!session?.user && <LoginBanner />}

      <header className="relative isolate">
        <Backdrop src={cover} />
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-8 sm:px-6">
          <Breadcrumbs
            items={[
              { label: playlist.tutor.name, href: `/${tutorSlug}` },
              { label: playlist.title },
            ]}
          />

          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
            <Thumb
              src={cover}
              sizes="(min-width: 768px) 360px, 100vw"
              priority
              className="w-full shrink-0 rounded-xl shadow-2xl shadow-black/60 md:w-[360px]"
            />
            <div className="min-w-0">
              <p className="font-semibold text-pen">Playlist</p>
              <h1 className="mt-1 text-3xl leading-tight sm:text-4xl lg:text-5xl">{playlist.title}</h1>
              <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 tabular-nums text-pencil">
                <Link href={`/${tutorSlug}`} className="flex items-center gap-2 font-semibold text-ink hover:underline">
                  <Avatar src={playlist.tutor.imageUrl} name={playlist.tutor.name} size={24} />
                  {playlist.tutor.name}
                </Link>
                <span>
                  {videos.length} pertemuan{totalSeconds > 0 && `, ${formatTotalDuration(totalSeconds)}`}
                </span>
              </p>
              {playlist.description && (
                <p className="mt-3 line-clamp-2 max-w-2xl text-pencil">{playlist.description}</p>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-5">
            {nextVideo && (
              <Link href={`${hrefBase}/${nextVideo.id}`} className="group flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-pen text-paper shadow-lg shadow-black/40 transition-transform group-hover:scale-105">
                  <PlayIcon className="ml-0.5 h-6 w-6" />
                </span>
                <span className="font-bold">
                  {nextVideo.status === "unwatched" && completedCount === 0
                    ? "Mulai dari pertemuan 1"
                    : `Lanjutkan pertemuan ${nextVideo.orderIndex}`}
                </span>
              </Link>
            )}
            {userId && (
              <p className="tabular-nums text-pencil">
                {completedCount} dari {videos.length} selesai
              </p>
            )}
          </div>

          {userId && (
            <div className="mt-6">
              <MutabaahGrid videos={videos} hrefBase={hrefBase} compact />
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-2 pb-16 sm:px-4">
        <ol className="space-y-1">
          {videos.map((video) => (
            <VideoRow
              key={video.id}
              href={`${hrefBase}/${video.id}`}
              title={video.title}
              orderIndex={video.orderIndex}
              youtubeVideoId={video.youtubeVideoId}
              durationSeconds={video.durationSeconds}
              watchedSeconds={video.lastWatchedSeconds}
              isCompleted={video.status === "completed"}
            />
          ))}
        </ol>
      </div>
    </>
  );
}
