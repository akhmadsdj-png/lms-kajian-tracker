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

  return (
    <div className="relative min-h-[calc(100vh-57px)]">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      
      <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <h1 className="mb-8 text-2xl font-bold text-white sm:text-3xl">
          ⚙️ Admin Panel
        </h1>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Form */}
          <div className="md:col-span-1">
            <div className="glass-card rounded-2xl p-5">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Tambah Ustadz
              </h2>
              
              <form action={addTutorAction} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-400 mb-1">
                    Nama Ustadz
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    placeholder="Contoh: Ustadz Syafiq Riza Basalamah"
                    className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
                
                <div>
                  <label htmlFor="youtubeChannelId" className="block text-sm font-medium text-slate-400 mb-1">
                    YouTube Channel ID
                  </label>
                  <input
                    type="text"
                    id="youtubeChannelId"
                    name="youtubeChannelId"
                    required
                    placeholder="Contoh: UCxxx..."
                    className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                  <p className="mt-1.5 text-xs text-slate-500">
                    ID Channel YouTube bisa didapatkan dari URL channel.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-500"
                >
                  Simpan & Tambahkan
                </button>
              </form>
            </div>
          </div>

          {/* List */}
          <div className="md:col-span-2">
            <div className="glass-card rounded-2xl p-5">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Daftar Ustadz ({tutors.length})
              </h2>
              
              <div className="space-y-3">
                {tutors.map((tutor) => (
                  <div
                    key={tutor.id}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4"
                  >
                    <div>
                      <h3 className="font-medium text-white">{tutor.name}</h3>
                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                        <span>ID: {tutor.youtubeChannelId || "-"}</span>
                        <span>•</span>
                        <span>{tutor._count.playlists} Playlist tersinkronisasi</span>
                      </div>
                    </div>
                  </div>
                ))}

                {tutors.length === 0 && (
                  <p className="py-4 text-center text-sm text-slate-500">
                    Belum ada ustadz yang ditambahkan.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
