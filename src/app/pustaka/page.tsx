import Link from "next/link";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { videoThumb } from "@/lib/youtube";
import { PlaylistTile } from "@/components/media/PlaylistTile";
import { SignInButton } from "@/components/shell/SignInButton";
import { CreatePlaylistForm } from "./CreatePlaylistForm";

export default async function LibraryPage() {
  await connection();
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-sans text-3xl font-bold">Pustaka kamu</h1>
        <p className="mt-3 text-pencil">
          Masuk untuk menyusun playlist sendiri dari kajian ustadz mana saja, dan menyimpan pertemuan untuk ditonton nanti.
        </p>
        <SignInButton className="mt-6 rounded-full bg-ink px-6 py-2.5 font-bold text-paper hover:opacity-90">
          Masuk dengan Google
        </SignInButton>
      </div>
    );
  }

  const playlists = await prisma.userPlaylist.findMany({
    where: { userId },
    orderBy: [{ isWatchLater: "desc" }, { updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      isWatchLater: true,
      items: { orderBy: { position: "asc" }, select: { videoId: true, video: { select: { youtubeVideoId: true } } } },
    },
  });

  const allVideoIds = [...new Set(playlists.flatMap((p) => p.items.map((i) => i.videoId)))];
  const completed = new Set(
    (
      await prisma.userProgress.findMany({
        where: { userId, isCompleted: true, videoId: { in: allVideoIds } },
        select: { videoId: true },
      })
    ).map((r) => r.videoId),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 pb-16 sm:px-6 sm:pt-10">
      <h1 className="font-sans text-3xl font-bold sm:text-4xl">Pustaka kamu</h1>
      <p className="mt-2 max-w-2xl text-pencil">
        Susun playlist sendiri dari kajian ustadz mana saja. Tekan <b className="text-ink">Simpan</b> di halaman video untuk
        menambahkan pertemuan. Playlist kajian yang sedang kamu ikuti ada di{" "}
        <Link href="/progres" className="font-semibold text-pen hover:underline">
          Progres
        </Link>
        .
      </p>

      <div className="mt-6 max-w-xl">
        <CreatePlaylistForm />
      </div>

      {playlists.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-rule p-8 text-center">
          <h2 className="font-sans text-xl font-bold">Belum ada playlist</h2>
          <p className="mt-2 text-pencil">
            Buat playlist di atas, atau buka sebuah pertemuan lalu tekan Simpan. &ldquo;Tonton nanti&rdquo; dibuat otomatis.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-8 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {playlists.map((p) => (
            <PlaylistTile
              key={p.id}
              href={`/pustaka/${p.id}`}
              title={p.title}
              thumbnailUrl={p.items[0] ? videoThumb(p.items[0].video.youtubeVideoId) : null}
              totalVideos={p.items.length}
              completedVideos={p.items.filter((i) => completed.has(i.videoId)).length}
              subtitle={p.isWatchLater ? "Disimpan untuk nanti" : "Playlist pribadi"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
