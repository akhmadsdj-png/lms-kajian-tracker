import { auth } from "@/lib/auth";
import { displayTitle } from "@/lib/format";
import { ScrollToActive } from "@/components/ScrollToActive";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { MarkCompleteButton } from "@/components/MarkCompleteButton";
import { VideoListItem } from "@/components/VideoListItem";
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

  return (
    <>
      {!session?.user && <LoginBanner />}

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Breadcrumbs
          items={[
            { label: video.playlist.tutor.name, href: `/${tutorSlug}` },
            { label: video.playlist.title, href: hrefBase },
            { label: `Pertemuan ${video.orderIndex}` },
          ]}
        />

        <div className="flex flex-col gap-10 lg:flex-row">
          <div className="min-w-0 flex-1">
            <YouTubePlayer
              videoId={video.youtubeVideoId}
              dbVideoId={video.id}
              startSeconds={startSeconds}
            />

            <p className="mt-6 text-pencil tabular-nums">
              Pertemuan {video.orderIndex} dari {sidebarVideos.length}
            </p>
            <h1 className="mt-1 max-w-3xl text-2xl sm:text-3xl">{displayTitle(video.title)}</h1>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
              {session?.user ? (
                <MarkCompleteButton videoId={video.id} initialCompleted={isCompleted} />
              ) : (
                <Link
                  href="/api/auth/signin"
                  className="rounded-md border border-rule px-4 py-2 font-semibold hover:bg-surface"
                >
                  Masuk untuk menandai selesai
                </Link>
              )}

              <div className="flex gap-5 sm:ml-auto">
                {prevVideo && (
                  <Link href={`${hrefBase}/${prevVideo.id}`} className="text-pen hover:underline underline-offset-4">
                    Pertemuan {prevVideo.orderIndex}
                  </Link>
                )}
                {nextVideo && (
                  <Link href={`${hrefBase}/${nextVideo.id}`} className="font-semibold text-pen hover:underline underline-offset-4">
                    Berikutnya: pertemuan {nextVideo.orderIndex}
                  </Link>
                )}
              </div>
            </div>
          </div>

          <aside className="w-full shrink-0 lg:w-80 xl:w-96">
            <h2 className="text-lg">
              <Link href={hrefBase} className="hover:underline underline-offset-4">
                {video.playlist.title}
              </Link>
            </h2>
            <div className="mt-3 mb-6">
              <MutabaahGrid videos={gridVideos} hrefBase={hrefBase} activeId={video.id} compact />
            </div>
            <ScrollToActive className="max-h-[60vh] overflow-y-auto border-t border-rule">
              {sidebarVideos.map((v) => {
                const vProgress = sidebarProgressMap.get(v.id);
                return (
                  <li key={v.id}>
                    <VideoListItem
                      title={v.title}
                      videoId={v.id}
                      orderIndex={v.orderIndex}
                      playlistSlug={playlistSlug}
                      tutorSlug={tutorSlug}
                      lastWatchedSeconds={vProgress?.lastWatchedSeconds ?? 0}
                      isCompleted={vProgress?.isCompleted ?? false}
                      isActive={v.id === videoId}
                    />
                  </li>
                );
              })}
            </ScrollToActive>
          </aside>
        </div>
      </div>
    </>
  );
}
