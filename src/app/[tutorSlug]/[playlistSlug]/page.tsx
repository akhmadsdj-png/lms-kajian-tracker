import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { VideoListItem } from "@/components/VideoListItem";

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ tutorSlug: string; playlistSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const { tutorSlug, playlistSlug } = await params;

  const playlist = await prisma.playlist.findUnique({
    where: { slug: playlistSlug },
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
  });

  if (!playlist || playlist.tutor.slug !== tutorSlug) notFound();

  const completedCount = playlist.videos.filter(
    (v) => v.progress[0]?.isCompleted
  ).length;
  const progressPercent =
    playlist.videos.length > 0
      ? Math.round((completedCount / playlist.videos.length) * 100)
      : 0;

  return (
    <div className="relative min-h-[calc(100vh-57px)]">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute right-1/4 top-0 h-[300px] w-[300px] rounded-full bg-emerald-500/[0.05] blur-[100px]" />

      <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <Breadcrumbs
          items={[
            { label: playlist.tutor.name, href: `/${tutorSlug}` },
            { label: playlist.title },
          ]}
        />

        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
            {playlist.title}
          </h1>
          {playlist.description && (
            <p className="mb-4 text-sm text-slate-400">
              {playlist.description}
            </p>
          )}

          {/* Overall progress */}
          <div className="glass-card rounded-xl p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-400">
                {completedCount} dari {playlist.videos.length} video selesai
              </span>
              <span className="font-semibold text-emerald-400">
                {progressPercent}%
              </span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-slate-700/50">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Video List */}
        <div className="space-y-2">
          {playlist.videos.map((video) => {
            const progress = video.progress[0];
            return (
              <VideoListItem
                key={video.id}
                title={video.title}
                videoId={video.id}
                orderIndex={video.orderIndex}
                playlistSlug={playlistSlug}
                tutorSlug={tutorSlug}
                lastWatchedSeconds={progress?.lastWatchedSeconds ?? 0}
                isCompleted={progress?.isCompleted ?? false}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
