export default function PlaylistLoading() {
  return (
    <div className="relative min-h-[calc(100vh-57px)]">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute right-1/4 top-0 h-[300px] w-[300px] rounded-full bg-emerald-500/[0.05] blur-[100px]" />

      <div className="relative mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Breadcrumb skeleton */}
        <div className="mb-6 h-4 w-64 animate-pulse rounded bg-slate-800" />

        {/* Header skeleton */}
        <div className="mb-8">
          <div className="mb-2 h-8 w-64 animate-pulse rounded bg-slate-800" />
          <div className="mb-4 h-4 w-80 animate-pulse rounded bg-slate-800" />

          {/* Progress card skeleton */}
          <div className="rounded-xl border border-white/[0.06] bg-slate-800/50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="h-4 w-40 animate-pulse rounded bg-slate-700" />
              <div className="h-4 w-10 animate-pulse rounded bg-slate-700" />
            </div>
            <div className="h-2 w-full animate-pulse rounded-full bg-slate-700" />
          </div>
        </div>

        {/* Video list skeleton */}
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-slate-800/30 p-4"
            >
              <div className="h-5 w-5 animate-pulse rounded bg-slate-700" />
              <div className="flex-1">
                <div className="h-4 w-48 animate-pulse rounded bg-slate-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
