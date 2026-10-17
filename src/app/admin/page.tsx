import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { addTutorAction } from "./actions";
import { connection } from "next/server";

export default async function AdminPage() {
  await connection();
  const session = await auth();

  if (!isAdmin(session?.user?.email)) {
    redirect("/dashboard");
  }

  const tutors = await prisma.tutor.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { playlists: true },
      },
    },
  });

  const inputClass =
    "w-full rounded-md border border-rule bg-paper px-3 py-2 placeholder:text-pencil/70 focus:border-pen focus:outline-none";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="mb-10 text-3xl">Kelola pengajar</h1>

      <div className="grid gap-12 md:grid-cols-[18rem_1fr]">
        <section>
          <h2 className="mb-4 text-xl">Tambah pengajar</h2>
          <form action={addTutorAction} className="space-y-5">
            <div>
              <label htmlFor="name" className="mb-1 block font-semibold">
                Nama
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="Ustadz Syafiq Riza Basalamah"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="youtubeChannelId" className="mb-1 block font-semibold">
                ID channel YouTube
              </label>
              <input
                type="text"
                id="youtubeChannelId"
                name="youtubeChannelId"
                required
                placeholder="UC…"
                className={inputClass}
              />
              <p className="mt-1.5 text-sm text-pencil">
                Diawali UC, ada di URL channel: youtube.com/channel/UC…
              </p>
            </div>

            <button
              type="submit"
              className="rounded-md bg-pen px-4 py-2 font-semibold text-paper hover:opacity-90"
            >
              Tambah pengajar
            </button>
          </form>
        </section>

        <section>
          <h2 className="mb-2 text-xl">{tutors.length} pengajar</h2>
          {tutors.length === 0 ? (
            <p className="border-t border-rule py-4 text-pencil">
              Belum ada pengajar. Tambahkan lewat formulir di samping.
            </p>
          ) : (
            <ul className="border-t border-rule">
              {tutors.map((tutor) => (
                <li key={tutor.id} className="border-b border-rule px-2 py-3">
                  <p className="font-semibold">{tutor.name}</p>
                  <p className="text-sm text-pencil">
                    {tutor._count.playlists} playlist tersinkron, channel {tutor.youtubeChannelId || "belum diisi"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
