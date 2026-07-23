import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { YouTubePlayer } from "@/components/YouTubePlayer";
import { MarkCompleteButton } from "@/components/MarkCompleteButton";
import { VideoListItem } from "@/components/VideoListItem";
import { LoginBanner } from "@/components/LoginBanner";
import Link from "next/link";
import {
  getVideoPageData,
  getVideoProgress,
  getSidebarVideos,
} from "@/lib/queries";

export default async function VideoPage({
  params,
}: {
  params: Promise<{ tutorSlug: string; playlistSlug: string; videoId: string }>;
}) {
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

  const sidebarVideos = await getSidebarVideos(video.playlist.id);

  // Fetch progress separately (cached per user)
  let userProgress = null;
  const sidebarProgressMap = new Map<string, { lastWatchedSeconds: number; isCompleted: boolean }>();

  if (userId) {
    const [currentProgress, allProgress] = await Promise.all([
      getVideoProgress(userId, videoId),
      getVideoProgress(userId, videoId).then(() =>
        // Fetch all sidebar progress in parallel
        Promise.all(
          sidebarVideos.map((sv) => getVideoProgress(userId, sv.id))
        )
      ),
    ]);
    userProgress = currentProgress;
    for (let i = 0; i < sidebarVideos.length; i++) {
      const p = allProgress[i];
      if (p) sidebarProgressMap.set(sidebarVideos[i].id, p);
    }
  }

  const startSeconds = userProgress?.lastWatchedSeconds ?? 0;
  const isCompleted = userProgress?.isCompleted ?? false;

  // Find next and previous video
  const currentIndex = sidebarVideos.findIndex((v) => v.id === videoId);
  const nextVideo = currentIndex < sidebarVideos.length - 1 ? sidebarVideos[currentIndex + 1] : null;
  const prevVideo = currentIndex > 0 ? sidebarVideos[currentIndex - 1] : null;

  return (
    <div className="relative min-h-[calc(100vh-57px)]">
      {/* Login Banner for guests */}
      {!session?.user && <LoginBanner />}

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
                {session?.user ? (
                  <MarkCompleteButton
                    videoId={video.id}
                    initialCompleted={isCompleted}
                  />
                ) : (
                  <Link
                    href="/api/auth/signin"
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-400 transition-all hover:border-amber-500/50 hover:bg-amber-500/20"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Login untuk Tandai Selesai
                  </Link>
                )}

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
                {sidebarVideos.map((v) => {
                  const vProgress = sidebarProgressMap.get(v.id);
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
