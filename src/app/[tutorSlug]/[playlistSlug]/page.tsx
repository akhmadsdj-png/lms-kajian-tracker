import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { VideoListItem } from "@/components/VideoListItem";
import { MutabaahGrid, type VideoStatus } from "@/components/MutabaahGrid";
import Link from "next/link";
import { getPlaylistPageData, getPlaylistProgress } from "@/lib/queries";
import { connection } from "next/server";

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ tutorSlug: string; playlistSlug: string }>;
}) {
  await connection();
  const session = await auth();
  if (!session?.user?.id) redirect("/");
  const userId = session.user.id;

  const { tutorSlug, playlistSlug } = await params;

  const playlist = await getPlaylistPageData(playlistSlug);
  if (!playlist || playlist.tutor.slug !== tutorSlug) notFound();

  // Fetch user progress separately (cached per user)
  const progressRows = await getPlaylistProgress(userId, playlist.id);
  const progressMap = new Map(
    progressRows.map((r) => [r.videoId, r])
  );

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
  const nextVideo = videos.find((v) => v.status !== "completed");
  const hrefBase = `/${tutorSlug}/${playlistSlug}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Breadcrumbs
        items={[
          { label: playlist.tutor.name, href: `/${tutorSlug}` },
          { label: playlist.title },
        ]}
      />

      <header className="mb-8 max-w-2xl">
        <h1 className="text-3xl sm:text-4xl">{playlist.title}</h1>
        {playlist.description && (
          <p className="mt-3 line-clamp-4 text-pencil">{playlist.description}</p>
        )}
      </header>

      <section className="mb-12" aria-labelledby="progress-heading">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
          <h2 id="progress-heading" className="text-xl tabular-nums">
            {completedCount} dari {videos.length} pertemuan selesai
          </h2>
          {nextVideo && (
            <Link
              href={`${hrefBase}/${nextVideo.id}`}
              className="rounded-md bg-pen px-4 py-2 font-semibold text-paper hover:opacity-90"
            >
              {completedCount === 0 && nextVideo.status === "unwatched"
                ? "Mulai dari pertemuan 1"
                : `Lanjutkan pertemuan ${nextVideo.orderIndex}`}
            </Link>
          )}
        </div>
        <MutabaahGrid videos={videos} hrefBase={hrefBase} />
      </section>

      <h2 className="mb-2 text-xl">Daftar pertemuan</h2>
      <ul className="border-t border-rule">
        {videos.map((video) => (
          <li key={video.id}>
            <VideoListItem
              title={video.title}
              videoId={video.id}
              orderIndex={video.orderIndex}
              playlistSlug={playlistSlug}
              tutorSlug={tutorSlug}
              lastWatchedSeconds={video.lastWatchedSeconds}
              isCompleted={video.status === "completed"}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
