import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PlaylistRow } from "@/components/PlaylistRow";
import { getTutorPageData, getTutorProgress } from "@/lib/queries";
import { connection } from "next/server";

export default async function TutorPage({
  params,
}: {
  params: Promise<{ tutorSlug: string }>;
}) {
  await connection();
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const userId = session.user.id;

  const { tutorSlug } = await params;

  const tutor = await getTutorPageData(tutorSlug);
  if (!tutor) notFound();

  // Fetch user progress separately (cached per user)
  const progressRows = await getTutorProgress(userId, tutor.id);
  const progressByPlaylist = new Map<string, { completed: number; inProgress: number }>();
  for (const r of progressRows) {
    const counts = progressByPlaylist.get(r.video.playlistId) ?? { completed: 0, inProgress: 0 };
    if (r.isCompleted) counts.completed++;
    else if (r.lastWatchedSeconds > 0) counts.inProgress++;
    progressByPlaylist.set(r.video.playlistId, counts);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs items={[{ label: tutor.name }]} />

      <header className="mb-10 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl">{tutor.name}</h1>
        {tutor.bio && <p className="mt-3 text-pencil">{tutor.bio}</p>}
      </header>

      <h2 className="mb-2 text-xl">
        {tutor.playlists.length} playlist
      </h2>

      {tutor.playlists.length === 0 ? (
        <p className="border-t border-rule py-4 text-pencil">
          Playlist muncul di sini setelah sinkronisasi harian dari YouTube berjalan.
        </p>
      ) : (
        <ul className="border-t border-rule">
          {tutor.playlists.map((playlist) => {
            const counts = progressByPlaylist.get(playlist.id);
            return (
              <PlaylistRow
                key={playlist.id}
                title={playlist.title}
                description={playlist.description}
                href={`/${tutor.slug}/${playlist.slug}`}
                totalVideos={playlist._count.videos}
                completedVideos={counts?.completed ?? 0}
                inProgressVideos={counts?.inProgress ?? 0}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}
