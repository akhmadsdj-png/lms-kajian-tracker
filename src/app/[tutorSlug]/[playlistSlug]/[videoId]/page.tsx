import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { MarkCompleteButton } from "@/components/MarkCompleteButton";
import { VideoListItem } from "@/components/VideoListItem";
import Link from "next/link";

export default async function VideoPage({
  params,
}: {
  params: Promise<{ tutorSlug: string; playlistSlug: string; videoId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const { tutorSlug, playlistSlug, videoId } = await params;

  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: {
      playlist: {
        include: {
          tutor: true,
          videos: {
            include: {
              progress: {
                where: { userId: session.user.id },
              },
            },
            orderBy: { orderIndex: "asc" },
          },
        },
      },
      progress: {
        where: { userId: session.user.id },
      },
    },
  });

  if (
    !video ||
    video.playlist.slug !== playlistSlug ||
    video.playlist.tutor.slug !== tutorSlug
  ) {
    notFound();
  }

  const userProgress = video.progress[0];
  const startSeconds = userProgress?.lastWatchedSeconds ?? 0;
  const isCompleted = userProgress?.isCompleted ?? false;

  // Find next and previous video
  const allVideos = video.playlist.videos;
  const currentIndex = allVideos.findIndex((v) => v.id === videoId);
  const nextVideo = currentIndex < allVideos.length - 1 ? allVideos[currentIndex + 1] : null;
  const prevVideo = currentIndex > 0 ? allVideos[currentIndex - 1] : null;

  return (
    <div className="relative min-h-[calc(100vh-57px)]">
      <div className="bg-grid pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Breadcrumbs
          items={[
            {
              label: video.playlist.tutor.name,
              href: `/${tutorSlug}`,
            },
            {
              label: video.playlist.title,
              href: `/${tutorSlug}/${playlistSlug}`,
            },
            { label: video.title },
          ]}
        />

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Player */}
            <YouTubePlayer
              videoId={video.youtubeVideoId}
              dbVideoId={video.id}
              startSeconds={startSeconds}
            />

            {/* Video info */}
            <div className="mt-5">
              <h1 className="mb-4 text-xl font-bold text-white sm:text-2xl">
                {video.title}
              </h1>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <MarkCompleteButton
                  videoId={video.id}
                  initialCompleted={isCompleted}
                />

                {/* Navigation */}
                <div className="flex gap-2 sm:ml-auto">
                  {prevVideo && (
                    <Link
                      href={`/${tutorSlug}/${playlistSlug}/${prevVideo.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-400 transition-all hover:border-white/20 hover:text-white"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                      </svg>
                      Sebelumnya
                    </Link>
                  )}
                  {nextVideo && (
                    <Link
                      href={`/${tutorSlug}/${playlistSlug}/${nextVideo.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-slate-700"
                    >
                      Selanjutnya
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Playlist */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0">
            <div className="glass-card sticky top-20 rounded-2xl p-4">
              <h2 className="mb-3 text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Daftar Video
              </h2>
              <div className="max-h-[calc(100vh-180px)] space-y-1.5 overflow-y-auto pr-1">
                {allVideos.map((v) => {
                  const vProgress = v.progress[0];
                  return (
                    <VideoListItem
                      key={v.id}
                      title={v.title}
                      videoId={v.id}
                      orderIndex={v.orderIndex}
                      playlistSlug={playlistSlug}
                      tutorSlug={tutorSlug}
                      lastWatchedSeconds={vProgress?.lastWatchedSeconds ?? 0}
                      isCompleted={vProgress?.isCompleted ?? false}
                      isActive={v.id === videoId}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
