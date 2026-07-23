export default function VideoLoading() {
  return (
    <div className="relative min-h-[calc(100vh-57px)]">
      <div className="bg-grid pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Breadcrumb skeleton */}
        <div className="mb-6 h-4 w-80 animate-pulse rounded bg-slate-800" />

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Main content skeleton */}
          <div className="flex-1 min-w-0">
            {/* Player skeleton */}
            <div className="aspect-video w-full animate-pulse rounded-2xl bg-slate-800" />

            {/* Video info skeleton */}
            <div className="mt-5">
              <div className="mb-4 h-7 w-64 animate-pulse rounded bg-slate-800" />
              <div className="flex flex-wrap items-center gap-3">
                <div className="h-11 w-44 animate-pulse rounded-xl bg-slate-800" />
                <div className="flex gap-2 sm:ml-auto">
                  <div className="h-11 w-32 animate-pulse rounded-xl bg-slate-800" />
                  <div className="h-11 w-32 animate-pulse rounded-xl bg-slate-800" />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0">
            <div className="rounded-2xl border border-white/[0.06] bg-slate-800/30 p-4">
              <div className="mb-3 h-4 w-28 animate-pulse rounded bg-slate-700" />
              <div className="space-y-1.5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg p-2"
                  >
                    <div className="h-5 w-5 animate-pulse rounded bg-slate-700" />
                    <div className="h-3 w-40 animate-pulse rounded bg-slate-700" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
