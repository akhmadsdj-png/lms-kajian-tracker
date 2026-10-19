import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { displayTitle } from "@/lib/format";
import { ScrollToActive } from "@/components/ScrollToActive";
import { notFound } from "next/navigation";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { MarkCompleteButton } from "@/components/MarkCompleteButton";
import { SaveButton } from "@/components/SaveButton";
import { Avatar } from "@/components/media/Avatar";
import { VideoRow } from "@/components/media/VideoRow";
import { MutabaahGrid, type VideoStatus } from "@/components/MutabaahGrid";
import { LoginBanner } from "@/components/LoginBanner";
import Link from "next/link";
import {
  getVideoPageData,
  getPlaylistProgress,
  getSidebarVideos,
} from "@/lib/queries";
import { connection } from "next/server";

export default async function VideoPage({
  params,
}: {
  params: Promise<{ tutorSlug: string; playlistSlug: string; videoId: string }>;
}) {
  await connection();
  const session = await auth();
  const userId = session?.user?.id;

  const { tutorSlug, playlistSlug, videoId } = await params;

  const video = await getVideoPageData(videoId);

  if (
    !video ||
    video.playlist.slug !== playlistSlug ||
    video.playlist.tutor.slug !== tutorSlug
  ) {
    notFound();
  }

  // Sidebar list and the user's progress for the whole playlist, in parallel (one query each)
  const [sidebarVideos, progressRows] = await Promise.all([
    getSidebarVideos(video.playlist.id),
    userId ? getPlaylistProgress(userId, video.playlist.id) : Promise.resolve([]),
  ]);

  const sidebarProgressMap = new Map(progressRows.map((r) => [r.videoId, r]));
  const userProgress = sidebarProgressMap.get(videoId) ?? null;

  // Whether this pertemuan is already in one of the viewer's own playlists ("Tersimpan")
  const savedInUserPlaylist = userId
    ? (await prisma.userPlaylistItem.count({ where: { videoId, playlist: { userId } } })) > 0
    : false;

  const startSeconds = userProgress?.lastWatchedSeconds ?? 0;
  const isCompleted = userProgress?.isCompleted ?? false;

  // Find next and previous video
  const currentIndex = sidebarVideos.findIndex((v) => v.id === videoId);
  const nextVideo = currentIndex < sidebarVideos.length - 1 ? sidebarVideos[currentIndex + 1] : null;
  const prevVideo = currentIndex > 0 ? sidebarVideos[currentIndex - 1] : null;

  const hrefBase = `/${tutorSlug}/${playlistSlug}`;
  const gridVideos = sidebarVideos.map((v) => {
    const p = sidebarProgressMap.get(v.id);
    const status: VideoStatus = p?.isCompleted
      ? "completed"
      : p && p.lastWatchedSeconds > 0
        ? "in-progress"
        : "unwatched";
    return { ...v, status };
  });
  const completedCount = gridVideos.filter((v) => v.status === "completed").length;

  return (
    <>
      {!session?.user && <LoginBanner />}

      <div className="mx-auto max-w-[1600px] px-0 pb-16 sm:px-6 sm:pt-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <div className="min-w-0 flex-1">
            <div className="sm:overflow-hidden sm:rounded-xl">
              <YouTubePlayer
                videoId={video.youtubeVideoId}
                dbVideoId={video.id}
                startSeconds={startSeconds}
              />
            </div>

            <div className="px-4 sm:px-0">
              <h1 className="mt-4 font-sans text-xl font-bold leading-snug sm:text-2xl">
                {displayTitle(video.title)}
              </h1>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <Link href={`/${tutorSlug}`} className="group flex items-center gap-3">
                  <Avatar src={video.playlist.tutor.imageUrl} name={video.playlist.tutor.name} size={40} />
                  <span>
                    <span className="block font-semibold group-hover:underline">{video.playlist.tutor.name}</span>
                    <span className="block text-sm tabular-nums text-pencil">
                      Pertemuan {video.orderIndex} dari {sidebarVideos.length}
                    </span>
                  </span>
                </Link>

                <div className="flex flex-wrap items-center gap-2">
                  {session?.user ? (
                    <>
                      <MarkCompleteButton videoId={video.id} initialCompleted={isCompleted} />
                      {/* key: reset the menu state when moving to another pertemuan */}
                      <SaveButton key={video.id} videoId={video.id} initialSaved={savedInUserPlaylist} />
                    </>
                  ) : (
                    <Link
                      href="/api/auth/signin"
                      className="rounded-full bg-raised px-4 py-2 font-semibold hover:bg-rule"
                    >
                      Masuk untuk menandai selesai
                    </Link>
                  )}
                  {prevVideo && (
                    <Link
                      href={`${hrefBase}/${prevVideo.id}`}
                      className="rounded-full bg-raised px-4 py-2 font-semibold hover:bg-rule"
                      aria-label={`Pertemuan sebelumnya, ${prevVideo.orderIndex}`}
                    >
                      Sebelumnya
                    </Link>
                  )}
                  {nextVideo && (
                    <Link
                      href={`${hrefBase}/${nextVideo.id}`}
                      className="rounded-full bg-ink px-4 py-2 font-semibold text-paper hover:opacity-90"
                    >
                      Berikutnya
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          <aside className="w-full shrink-0 px-2 sm:px-0 lg:w-[400px]">
            <div className="overflow-hidden rounded-xl border border-rule">
              <div className="bg-surface px-4 py-3">
                <Link href={hrefBase} className="line-clamp-1 font-bold hover:underline">
                  {video.playlist.title}
                </Link>
                <p className="mt-0.5 text-sm tabular-nums text-pencil">
                  {video.playlist.tutor.name}, {video.orderIndex}/{sidebarVideos.length}
                  {userId && `, ${completedCount} selesai`}
                </p>
                {userId && (
                  <div className="mt-3">
                    <MutabaahGrid videos={gridVideos} hrefBase={hrefBase} activeId={video.id} compact />
                  </div>
                )}
              </div>
              <ScrollToActive className="max-h-[70vh] space-y-0.5 overflow-y-auto p-1.5">
                {gridVideos.map((v) => {
                  const p = sidebarProgressMap.get(v.id);
                  return (
                    <VideoRow
                      key={v.id}
                      compact
                      href={`${hrefBase}/${v.id}`}
                      title={v.title}
                      orderIndex={v.orderIndex}
                      youtubeVideoId={v.youtubeVideoId}
                      durationSeconds={v.durationSeconds}
                      watchedSeconds={p?.lastWatchedSeconds ?? 0}
                      isCompleted={p?.isCompleted ?? false}
                      isActive={v.id === videoId}
                    />
                  );
                })}
              </ScrollToActive>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
