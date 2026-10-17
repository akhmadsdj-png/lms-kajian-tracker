import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { LoginBanner } from "@/components/LoginBanner";
import { Avatar } from "@/components/media/Avatar";
import { Backdrop } from "@/components/media/Backdrop";
import { PlaylistTile } from "@/components/media/PlaylistTile";
import { getTutorPageData, getTutorProgress } from "@/lib/queries";
import { connection } from "next/server";

export default async function TutorPage({
  params,
}: {
  params: Promise<{ tutorSlug: string }>;
}) {
  await connection();
  const session = await auth();
  const userId = session?.user?.id;

  const { tutorSlug } = await params;

  const tutor = await getTutorPageData(tutorSlug);
  if (!tutor) notFound();

  const progressRows = userId ? await getTutorProgress(userId, tutor.id) : [];
  const completedByPlaylist = new Map<string, number>();
  for (const r of progressRows) {
    if (!r.isCompleted) continue;
    completedByPlaylist.set(r.video.playlistId, (completedByPlaylist.get(r.video.playlistId) ?? 0) + 1);
  }

  const totalVideos = tutor.playlists.reduce((n, p) => n + p._count.videos, 0);

  return (
    <>
      {!session?.user && <LoginBanner />}

      <header className="relative isolate">
        <Backdrop src={tutor.imageUrl} />
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-10 sm:px-6">
          <Breadcrumbs items={[{ label: tutor.name }]} />
          <div className="mt-6 flex flex-col items-start gap-6 sm:flex-row sm:items-end">
            <span className="rounded-full shadow-2xl shadow-black/60">
              <Avatar src={tutor.imageUrl} name={tutor.name} size={160} />
            </span>
            <div>
              <p className="font-semibold text-pen">Pengajar</p>
              <h1 className="mt-1 text-4xl leading-tight sm:text-5xl lg:text-6xl">{tutor.name}</h1>
              <p className="mt-3 tabular-nums text-pencil">
                {tutor.playlists.length} playlist, {totalVideos.toLocaleString("id-ID")} pertemuan
              </p>
              {tutor.bio && <p className="mt-3 max-w-2xl text-pencil">{tutor.bio}</p>}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <h2 className="mb-5 font-sans text-xl font-bold">Playlist</h2>
        {tutor.playlists.length === 0 ? (
          <p className="text-pencil">
            Playlist muncul di sini setelah sinkronisasi harian dari YouTube berjalan.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {tutor.playlists.map((playlist) => (
              <PlaylistTile
                key={playlist.id}
                href={`/${tutor.slug}/${playlist.slug}`}
                title={playlist.title}
                thumbnailUrl={playlist.thumbnailUrl}
                totalVideos={playlist._count.videos}
                completedVideos={completedByPlaylist.get(playlist.id) ?? 0}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
