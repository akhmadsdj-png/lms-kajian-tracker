export default function TutorLoading() {
  return (
    <div className="relative min-h-[calc(100vh-57px)]">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute left-1/4 top-0 h-[300px] w-[300px] rounded-full bg-emerald-500/[0.05] blur-[100px]" />

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Breadcrumb skeleton */}
        <div className="mb-6 h-4 w-48 animate-pulse rounded bg-slate-800" />

        {/* Header skeleton */}
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 animate-pulse rounded-2xl bg-slate-800" />
            <div>
              <div className="h-8 w-48 animate-pulse rounded bg-slate-800" />
              <div className="mt-2 h-4 w-64 animate-pulse rounded bg-slate-800" />
            </div>
          </div>
        </div>

        {/* Playlists skeleton */}
        <div className="mb-6 h-5 w-48 animate-pulse rounded bg-slate-800" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6"
            >
              <div className="mb-2 h-5 w-40 animate-pulse rounded bg-slate-700" />
              <div className="mb-3 h-3 w-56 animate-pulse rounded bg-slate-700" />
              <div className="h-1.5 w-full animate-pulse rounded-full bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
