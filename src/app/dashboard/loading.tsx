export default function DashboardLoading() {
  return (
    <div className="relative min-h-[calc(100vh-57px)]">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-emerald-500/[0.05] blur-[100px]" />

      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Greeting skeleton */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-800" />
            <div>
              <div className="h-4 w-32 animate-pulse rounded bg-slate-800" />
              <div className="mt-1 h-7 w-48 animate-pulse rounded bg-slate-800" />
            </div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="mb-10 grid grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-slate-800 to-slate-900 p-4 sm:p-5"
            >
              <div className="h-8 w-16 animate-pulse rounded bg-slate-700" />
              <div className="mt-2 h-3 w-20 animate-pulse rounded bg-slate-700" />
            </div>
          ))}
        </div>

        {/* Tutors skeleton */}
        <div className="mb-6 h-6 w-28 animate-pulse rounded bg-slate-800" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6"
            >
              <div className="mb-3 h-14 w-14 animate-pulse rounded-xl bg-slate-700" />
              <div className="mb-1 h-5 w-32 animate-pulse rounded bg-slate-700" />
              <div className="mb-4 h-3 w-40 animate-pulse rounded bg-slate-700" />
              <div className="h-1.5 w-full animate-pulse rounded-full bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
