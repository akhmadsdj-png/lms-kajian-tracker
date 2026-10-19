import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getDashboardTutors, getDashboardUserProgress } from "@/lib/queries";
import { followedPlaylists, summarizeProgress } from "@/lib/library";
import { CATEGORIES } from "@/lib/categories";
import { Avatar } from "@/components/media/Avatar";
import { NavLink } from "./NavLink";
import { SignInButton } from "./SignInButton";
import { ChartIcon, CompassIcon, HomeIcon, PlusIcon } from "./icons";

const row = {
  className: "flex items-center gap-4 rounded-lg px-3 py-2",
  activeClassName: "bg-raised font-semibold",
  inactiveClassName: "hover:bg-surface",
};

export async function Sidebar() {
  const session = await auth();
  const userId = session?.user?.id;

  const [tutors, progressRows] = await Promise.all([
    getDashboardTutors(),
    userId ? getDashboardUserProgress(userId) : Promise.resolve([]),
  ]);

  const playlists = tutors.flatMap((t) => t.playlists.map((p) => ({ ...p, tutorSlug: t.slug })));
  const { completedByPlaylist, lastActivityByPlaylist } = summarizeProgress(progressRows);
  const library = followedPlaylists(playlists, lastActivityByPlaylist).slice(0, 12);

  return (
    <nav className="px-3 pt-1 pb-8">
      <NavLink href="/dashboard" {...row} icon={<HomeIcon />} activeIcon={<HomeIcon filled />}>
        Beranda
      </NavLink>
      <NavLink href="/progres" {...row} icon={<ChartIcon />} activeIcon={<ChartIcon filled />}>
        Progres
      </NavLink>
      <NavLink href="/search" {...row} icon={<CompassIcon />} activeIcon={<CompassIcon filled />}>
        Telusuri
      </NavLink>

      <Divider />

      <h2 className="px-3 pb-2 font-sans text-base font-bold">Pustaka kamu</h2>
      {!userId ? (
        <div className="mx-1 rounded-xl bg-pen-soft p-4">
          <p className="font-semibold">Simpan progres kajianmu</p>
          <p className="mt-1 text-sm text-pencil">
            Playlist yang sedang kamu ikuti akan muncul di sini.
          </p>
          <SignInButton className="mt-3 rounded-full bg-ink px-4 py-1.5 text-sm font-bold text-paper hover:opacity-90">
            Masuk
          </SignInButton>
        </div>
      ) : library.length === 0 ? (
        <p className="px-3 text-sm text-pencil">
          Mulai menonton satu pertemuan, playlist-nya akan tersimpan di sini.
        </p>
      ) : (
        <ul>
          {library.map((p) => {
            const done = completedByPlaylist.get(p.id) ?? 0;
            return (
              <li key={p.id}>
                <NavLink
                  href={`/${p.tutorSlug}/${p.slug}`}
                  prefix
                  className="flex items-center gap-3 rounded-lg p-2"
                  activeClassName="bg-raised"
                  inactiveClassName="hover:bg-surface"
                >
                      <span className="relative aspect-video w-16 shrink-0 overflow-hidden rounded-md bg-raised">
                        {p.thumbnailUrl && (
                          <Image src={p.thumbnailUrl} alt="" fill sizes="64px" unoptimized className="object-cover" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{p.title}</span>
                        <span className="block text-xs tabular-nums text-pencil">
                          {done} dari {p._count.videos} selesai
                        </span>
                      </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      )}

      <Divider />

      <h2 className="px-3 pb-2 font-sans text-base font-bold">Pengajar</h2>
      <ul>
        {tutors.map((t) => (
          <li key={t.id}>
            <NavLink
              href={`/${t.slug}`}
              prefix
              {...row}
              icon={<Avatar src={t.imageUrl} name={t.name} size={24} />}
            >
              <span className="truncate">{t.name}</span>
            </NavLink>
          </li>
        ))}
        <li>
          <NavLink
            href="/request-pengajar"
            {...row}
            icon={
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-pencil">
                <PlusIcon className="h-4 w-4" />
              </span>
            }
          >
            <span className="text-pencil">Request pengajar</span>
          </NavLink>
        </li>
      </ul>

      <Divider />

      <h2 className="px-3 pb-2 font-sans text-base font-bold">Kategori</h2>
      <ul>
        {CATEGORIES.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/dashboard?kategori=${c.slug}`}
              className="flex items-center gap-4 rounded-lg px-3 py-2 hover:bg-surface"
            >
              <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: c.color }} aria-hidden />
              <span className="truncate">{c.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-2 px-3 pt-1" aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="h-10 rounded-lg bg-surface" />
      ))}
    </div>
  );
}

function Divider() {
  return <hr className="mx-3 my-3 border-rule" />;
}
