import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PlaylistCard } from "@/components/PlaylistCard";
import { getTutorPageData, getTutorProgress } from "@/lib/queries";

export default async function TutorPage({
  params,
}: {
  params: Promise<{ tutorSlug: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");

  const { tutorSlug } = await params;

  const tutor = await getTutorPageData(tutorSlug);
  if (!tutor) notFound();

  // Fetch user progress separately (cached per user)
  const progressRows = await getTutorProgress(session.user.id, tutor.id);
  const progressMap = new Map(
    progressRows.map((r) => [r.videoId, r])
  );

  return (
    <div className="relative min-h-[calc(100vh-57px)]">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute left-1/4 top-0 h-[300px] w-[300px] rounded-full bg-emerald-500/[0.05] blur-[100px]" />

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Breadcrumbs items={[{ label: tutor.name }]} />

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-3xl shadow-lg">
              🕌
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {tutor.name}
              </h1>
              {tutor.bio && (
                <p className="mt-1 text-sm text-slate-400">{tutor.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Playlists Grid */}
        <h2 className="mb-6 text-lg font-semibold text-white">
          Daftar Playlist Kajian
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tutor.playlists.map((playlist) => {
            let completedCount = 0;
            let inProgressCount = 0;
            for (const v of playlist.videos) {
              const p = progressMap.get(v.id);
              if (p?.isCompleted) {
                completedCount++;
              } else if (p && p.lastWatchedSeconds > 0) {
                inProgressCount++;
              }
            }

            return (
              <PlaylistCard
                key={playlist.id}
                title={playlist.title}
                description={playlist.description}
                slug={playlist.slug}
                tutorSlug={tutor.slug}
                totalVideos={playlist.videos.length}
                completedVideos={completedCount}
                inProgressVideos={inProgressCount}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
