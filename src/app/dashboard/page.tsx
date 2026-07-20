import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  // Get all tutors with their playlists and user progress
  const tutors = await prisma.tutor.findMany({
    include: {
      playlists: {
        include: {
          videos: {
            include: {
              progress: {
                where: { userId: session.user.id },
              },
            },
          },
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  // Calculate overall stats
  let totalVideos = 0;
  let completedVideos = 0;
  let inProgressVideos = 0;

  tutors.forEach((tutor) => {
    tutor.playlists.forEach((playlist) => {
      playlist.videos.forEach((video) => {
        totalVideos++;
        const progress = video.progress[0];
        if (progress?.isCompleted) {
          completedVideos++;
        } else if (progress && progress.lastWatchedSeconds > 0) {
          inProgressVideos++;
        }
      });
    });
  });

  return (
    <div className="relative min-h-[calc(100vh-57px)]">
      {/* Background */}
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-emerald-500/[0.05] blur-[100px]" />

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Greeting */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            {session.user.image && (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "User"}
                width={48}
                height={48}
                className="rounded-xl ring-2 ring-emerald-500/20"
              />
            )}
            <div>
              <p className="text-sm text-slate-500">Assalamu&apos;alaikum,</p>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {session.user.name} 👋
              </h1>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-10 grid grid-cols-3 gap-3 sm:gap-4">
          {[
            {
              label: "Total Video",
              value: totalVideos,
              color: "text-slate-300",
              bg: "from-slate-800 to-slate-900",
            },
            {
              label: "Selesai",
              value: completedVideos,
              color: "text-emerald-400",
              bg: "from-emerald-950/50 to-slate-900",
            },
            {
              label: "Berlangsung",
              value: inProgressVideos,
              color: "text-amber-400",
              bg: "from-amber-950/30 to-slate-900",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-2xl border border-white/[0.06] bg-gradient-to-br ${stat.bg} p-4 sm:p-5`}
            >
              <p className={`text-2xl font-bold sm:text-3xl ${stat.color}`}>
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Tutors */}
        <h2 className="mb-6 text-xl font-semibold text-white">
          Pengajar
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tutors.map((tutor) => {
            const tutorTotalVideos = tutor.playlists.reduce(
              (sum, p) => sum + p.videos.length,
              0
            );
            const tutorCompletedVideos = tutor.playlists.reduce(
              (sum, p) =>
                sum +
                p.videos.filter((v) => v.progress[0]?.isCompleted).length,
              0
            );
            const tutorProgress =
              tutorTotalVideos > 0
                ? Math.round((tutorCompletedVideos / tutorTotalVideos) * 100)
                : 0;

            return (
              <Link
                key={tutor.id}
                href={`/${tutor.slug}`}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6 shadow-xl transition-all duration-300 hover:border-emerald-500/20 hover:shadow-emerald-500/5 hover:-translate-y-1">
                  <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/[0.08] blur-2xl transition-all duration-500 group-hover:bg-emerald-500/[0.15]" />

                  <div className="relative">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-2xl">
                      🕌
                    </div>
                    <h3 className="mb-1 text-lg font-semibold text-white transition-colors group-hover:text-emerald-400">
                      {tutor.name}
                    </h3>
                    <p className="mb-4 text-sm text-slate-500">
                      {tutor.playlists.length} playlist •{" "}
                      {tutorTotalVideos} video
                    </p>

                    {/* Progress bar */}
                    <div className="relative h-1.5 overflow-hidden rounded-full bg-slate-700/50">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                        style={{ width: `${tutorProgress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-right text-xs font-medium text-emerald-400">
                      {tutorProgress}%
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
