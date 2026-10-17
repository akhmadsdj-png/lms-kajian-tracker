import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Avatar } from "@/components/media/Avatar";
import { PlaylistTile } from "@/components/media/PlaylistTile";
import { Shelf } from "@/components/media/Shelf";
import { Thumb } from "@/components/media/Thumb";
import { SearchBox } from "@/components/shell/SearchBox";
import { CATEGORIES, categorize } from "@/lib/categories";
import { displayTitle } from "@/lib/format";
import { getDashboardTutors, searchCatalog } from "@/lib/queries";
import { videoThumb } from "@/lib/youtube";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await connection();
  const q = (await searchParams).q?.trim() ?? "";

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 pb-16 sm:px-6">
      <div className="mb-6 md:hidden">
        <SearchBox autoFocus={!q} />
      </div>
      {q ? <Results q={q} /> : <Browse />}
    </div>
  );
}

async function Results({ q }: { q: string }) {
  const { playlists, videos } = await searchCatalog(q);

  if (playlists.length === 0 && videos.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="font-sans text-2xl font-bold">Tidak ada hasil untuk “{q}”</h1>
        <p className="mt-2 text-pencil">
          Coba kata lain, misalnya nama kitab (Riyadush Shalihin), surat (Al-Kahfi), atau tema (sabar).
        </p>
        <Link href="/search" className="mt-6 inline-block rounded-full bg-ink px-5 py-2 font-bold text-paper">
          Lihat semua kategori
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-sans text-2xl font-bold">Hasil untuk “{q}”</h1>

      {playlists.length > 0 && (
        <Shelf title={`Playlist (${playlists.length})`}>
          {playlists.map((p) => (
            <PlaylistTile
              key={p.id}
              inShelf
              href={`/${p.tutor.slug}/${p.slug}`}
              title={p.title}
              thumbnailUrl={p.thumbnailUrl}
              totalVideos={p._count.videos}
              subtitle={p.tutor.name}
            />
          ))}
        </Shelf>
      )}

      {videos.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-sans text-xl font-bold">
            Pertemuan ({videos.length}
            {videos.length === 40 && "+"})
          </h2>
          <ul className="space-y-4">
            {videos.map((v) => {
              const href = `/${v.playlist.tutor.slug}/${v.playlist.slug}/${v.id}`;
              return (
                <li key={v.id}>
                  <Link href={href} className="group flex flex-col gap-3 sm:flex-row sm:gap-4">
                    <Thumb
                      src={videoThumb(v.youtubeVideoId)}
                      durationSeconds={v.durationSeconds}
                      sizes="(min-width: 640px) 320px, 100vw"
                      className="w-full shrink-0 sm:w-80"
                    />
                    <div className="min-w-0 sm:py-1">
                      <p className="line-clamp-2 text-lg font-semibold leading-snug group-hover:text-pen">
                        {displayTitle(v.title)}
                      </p>
                      <p className="mt-1 text-sm text-pencil">
                        Pertemuan {v.orderIndex}, {v.playlist.title}
                      </p>
                      <p className="mt-3 flex items-center gap-2 text-sm text-pencil">
                        <Avatar src={v.playlist.tutor.imageUrl} name={v.playlist.tutor.name} size={24} />
                        {v.playlist.tutor.name}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}

// Empty search: Spotify-style "browse all" tiles, one per category.
async function Browse() {
  const tutors = await getDashboardTutors();
  const playlists = tutors.flatMap((t) => t.playlists);

  const byCategory = new Map<string, typeof playlists>();
  for (const p of playlists) {
    const name = categorize(p.title);
    byCategory.set(name, [...(byCategory.get(name) ?? []), p]);
  }

  return (
    <>
      <h1 className="font-sans text-2xl font-bold sm:text-3xl">Telusuri semua</h1>
      <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {CATEGORIES.filter((c) => byCategory.has(c.name)).map((c) => {
          const items = byCategory.get(c.name)!;
          const cover = items.find((p) => p.thumbnailUrl)?.thumbnailUrl;
          return (
            <Link
              key={c.slug}
              href={`/dashboard?kategori=${c.slug}`}
              className="group relative aspect-[16/10] overflow-hidden rounded-xl p-4"
              style={{ backgroundColor: c.color }}
            >
              <p className="relative z-10 max-w-[70%] font-sans text-lg font-bold leading-tight sm:text-xl">
                {c.name}
              </p>
              <p className="relative z-10 mt-1 text-sm text-white/75">{items.length} playlist</p>
              {cover && (
                <span className="absolute -right-6 -bottom-2 aspect-video w-[62%] rotate-[18deg] overflow-hidden rounded-md shadow-xl shadow-black/40 transition-transform group-hover:rotate-[12deg]">
                  <Image src={cover} alt="" fill sizes="240px" unoptimized className="object-cover" />
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </>
  );
}
