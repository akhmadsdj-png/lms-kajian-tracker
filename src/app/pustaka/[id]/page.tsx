import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { displayTitle, formatTotalDuration } from "@/lib/format";
import { pickNextVideo } from "@/lib/library";
import { upsizeThumb, videoThumb } from "@/lib/youtube";
import { MutabaahGrid, type VideoStatus } from "@/components/MutabaahGrid";
import { Backdrop } from "@/components/media/Backdrop";
import { PlayIcon } from "@/components/media/PlayIcon";
import { Thumb } from "@/components/media/Thumb";
import { VideoRow } from "@/components/media/VideoRow";
import { ItemControls } from "../ItemControls";
import { PlaylistEditor } from "../PlaylistEditor";

export default async function UserPlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/pustaka");

  const { id } = await params;
  // Only the owner can open a user playlist
  const playlist = await prisma.userPlaylist.findFirst({
    where: { id, userId },
    select: {
      id: true,
      title: true,
      description: true,
      isWatchLater: true,
      items: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          video: {
            select: {
              id: true,
              title: true,
              youtubeVideoId: true,
              durationSeconds: true,
              playlist: { select: { slug: true, title: true, tutor: { select: { name: true, slug: true } } } },
            },
          },
        },
      },
    },
  });
  if (!playlist) notFound();

  const progressRows = await prisma.userProgress.findMany({
    where: { userId, videoId: { in: playlist.items.map((i) => i.video.id) } },
    select: { videoId: true, isCompleted: true, lastWatchedSeconds: true, updatedAt: true },
  });
  const progress = new Map(progressRows.map((r) => [r.videoId, r]));

  const videos = playlist.items.map((item, i) => {
    const v = item.video;
    const p = progress.get(v.id);
    const status: VideoStatus = p?.isCompleted ? "completed" : p && p.lastWatchedSeconds > 0 ? "in-progress" : "unwatched";
    return {
      itemId: item.id,
      id: v.id,
      title: v.title,
      orderIndex: i + 1,
      status,
      youtubeVideoId: v.youtubeVideoId,
      durationSeconds: v.durationSeconds,
      watchedSeconds: p?.lastWatchedSeconds ?? 0,
      href: `/${v.playlist.tutor.slug}/${v.playlist.slug}/${v.id}`,
      source: `${v.playlist.title}, ${v.playlist.tutor.name}`,
    };
  });

  const done = videos.filter((v) => v.status === "completed").length;
  const totalSeconds = videos.reduce((n, v) => n + (v.durationSeconds ?? 0), 0);
  const next = pickNextVideo(videos, (vid) => {
    const t = progress.get(vid)?.updatedAt;
    return t ? new Date(t).getTime() : undefined;
  });
  const cover = videos[0] ? upsizeThumb(videoThumb(videos[0].youtubeVideoId)) : null;

  return (
    <>
      <header className="relative isolate">
        <Backdrop src={cover} />
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-8 sm:px-6">
          <Link href="/pustaka" className="text-sm text-pencil hover:text-ink hover:underline">
            Pustaka kamu
          </Link>

          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
            <Thumb
              src={cover}
              sizes="(min-width: 768px) 360px, 100vw"
              className="w-full shrink-0 rounded-xl shadow-2xl shadow-black/60 md:w-[360px]"
            />
            <div className="min-w-0">
              <p className="font-semibold text-pen">{playlist.isWatchLater ? "Tonton nanti" : "Playlist pribadi"}</p>
              <h1 className="mt-1 text-3xl leading-tight sm:text-4xl lg:text-5xl">{playlist.title}</h1>
              <p className="mt-3 tabular-nums text-pencil">
                {videos.length} pertemuan{totalSeconds > 0 && `, ${formatTotalDuration(totalSeconds)}`}
                {videos.length > 0 && `, ${done} selesai`}
              </p>
              {playlist.description && <p className="mt-3 max-w-2xl text-pencil">{playlist.description}</p>}
              {!playlist.isWatchLater && (
                <PlaylistEditor id={playlist.id} title={playlist.title} description={playlist.description} />
              )}
            </div>
          </div>

          {next && (
            <Link href={next.href} className="group mt-8 flex w-fit items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-pen text-paper shadow-lg shadow-black/40 transition-transform group-hover:scale-105">
                <PlayIcon className="ml-0.5 h-6 w-6" />
              </span>
              <span className="font-bold">
                {next.status === "in-progress" ? "Lanjutkan" : "Putar"}: {displayTitle(next.title)}
              </span>
            </Link>
          )}

          {videos.length > 0 && (
            <div className="mt-6">
              <MutabaahGrid videos={videos} hrefBase="" compact />
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-2 pb-16 sm:px-4">
        {videos.length === 0 ? (
          <div className="mx-2 rounded-2xl border border-dashed border-rule p-8 text-center sm:mx-0">
            <h2 className="font-sans text-xl font-bold">Playlist ini masih kosong</h2>
            <p className="mt-2 text-pencil">
              Buka pertemuan mana saja, lalu tekan <b className="text-ink">Simpan</b> dan pilih &ldquo;{playlist.title}&rdquo;.
            </p>
            <Link href="/dashboard" className="mt-5 inline-block rounded-full bg-ink px-5 py-2 font-bold text-paper hover:opacity-90">
              Cari kajian
            </Link>
          </div>
        ) : (
          <ol className="space-y-1">
            {videos.map((v, i) => (
              <li key={v.itemId} className="flex items-center gap-1">
                <VideoRow
                  as="div"
                  href={v.href}
                  title={v.title}
                  orderIndex={v.orderIndex}
                  youtubeVideoId={v.youtubeVideoId}
                  durationSeconds={v.durationSeconds}
                  watchedSeconds={v.watchedSeconds}
                  isCompleted={v.status === "completed"}
                  subtitle={v.source}
                />
                <ItemControls itemId={v.itemId} first={i === 0} last={i === videos.length - 1} title={displayTitle(v.title)} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}
