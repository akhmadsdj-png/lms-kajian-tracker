import Link from "next/link";

interface PlaylistCardProps {
  title: string;
  description?: string | null;
  slug: string;
  tutorSlug: string;
  totalVideos: number;
  completedVideos: number;
  inProgressVideos: number;
}

export function PlaylistCard({
  title,
  description,
  slug,
  tutorSlug,
  totalVideos,
  completedVideos,
  inProgressVideos,
}: PlaylistCardProps) {
  const progressPercent =
    totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  return (
    <Link href={`/${tutorSlug}/${slug}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-5 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/20 hover:shadow-emerald-500/5 hover:-translate-y-1">
        {/* Decorative gradient orb */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/[0.07] blur-2xl transition-all duration-500 group-hover:bg-emerald-500/[0.12]" />

        <div className="relative">
          {/* Title */}
          <h3 className="mb-1.5 text-lg font-semibold text-white transition-colors group-hover:text-emerald-400">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="mb-4 line-clamp-2 text-sm text-slate-400">
              {description}
            </p>
          )}

          {/* Stats */}
          <div className="mb-3 flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {completedVideos} selesai
            </span>
            {inProgressVideos > 0 && (
              <span className="flex items-center gap-1 text-amber-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
                {inProgressVideos} berlangsung
              </span>
            )}
            <span className="text-slate-500">{totalVideos} video</span>
          </div>

          {/* Progress bar */}
          <div className="relative h-1.5 overflow-hidden rounded-full bg-slate-700/50">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Percentage */}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Progress
            </span>
            <span className="text-xs font-semibold text-emerald-400">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
