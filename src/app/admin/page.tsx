import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { addTutorAction, setRequestStatusAction } from "./actions";
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

  const requests = await prisma.tutorRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 50,
    include: { user: { select: { name: true, email: true } } },
  });
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const inputClass =
    "w-full rounded-md border border-rule bg-paper px-3 py-2 placeholder:text-pencil/70 focus:border-pen focus:outline-none";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="mb-10 text-3xl">Kelola pengajar</h1>

      <section className="mb-12">
        <h2 className="mb-2 text-xl">
          Request dan saran masuk{pendingCount > 0 && <span className="ml-2 rounded-full bg-pen px-2 py-0.5 font-sans text-sm text-paper">{pendingCount} baru</span>}
        </h2>
        {requests.length === 0 ? (
          <p className="border-t border-rule py-4 text-pencil">Belum ada request atau saran dari pengguna.</p>
        ) : (
          <ul className="border-t border-rule">
            {requests.map((r) => (
              <li key={r.id} className={`flex flex-col gap-3 border-b border-rule px-2 py-4 sm:flex-row sm:items-start sm:justify-between ${r.status === "pending" ? "" : "opacity-60"}`}>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-pen">{r.type === "feature" ? "Saran atau fitur" : "Pengajar"}</p>
                  <p className="font-semibold">{r.name}</p>
                  {r.channelUrl && (
                    <a href={r.channelUrl.startsWith("@") ? `https://www.youtube.com/${r.channelUrl}` : r.channelUrl} target="_blank" rel="noopener noreferrer" className="block truncate text-sm text-pen hover:underline">
                      {r.channelUrl}
                    </a>
                  )}
                  {r.note && <p className="mt-1 text-sm text-pencil">{r.note}</p>}
                  <p className="mt-1 text-xs text-pencil">
                    {r.user.name ?? r.user.email},{" "}
                    {new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {r.status === "pending" ? (
                    <>
                      <form action={setRequestStatusAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="status" value="added" />
                        <button className="rounded-full bg-pen px-3 py-1.5 text-sm font-semibold text-paper hover:opacity-90">
                          {r.type === "feature" ? "Tandai selesai" : "Tandai ditambahkan"}
                        </button>
                      </form>
                      <form action={setRequestStatusAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="status" value="rejected" />
                        <button className="rounded-full bg-raised px-3 py-1.5 text-sm font-semibold hover:bg-rule">Tolak</button>
                      </form>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-pencil">{r.status === "added" ? (r.type === "feature" ? "Selesai" : "Ditambahkan") : "Ditolak"}</span>
                      <form action={setRequestStatusAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="status" value="pending" />
                        <button className="text-sm text-pencil underline-offset-4 hover:text-ink hover:underline">Batalkan</button>
                      </form>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

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
                Channel YouTube
              </label>
              <input
                type="text"
                id="youtubeChannelId"
                name="youtubeChannelId"
                required
                placeholder="@amminurbaits"
                className={inputClass}
              />
              <p className="mt-1.5 text-sm text-pencil">
                Tempel URL channel, @handle, atau ID yang diawali UC.
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
