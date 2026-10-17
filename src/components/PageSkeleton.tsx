// Calm placeholder shown while a page streams in: heading block + ruled rows.
export function PageSkeleton({ rows = 6, wide = false }: { rows?: number; wide?: boolean }) {
  return (
    <div
      className={`mx-auto px-4 py-8 sm:px-6 sm:py-12 ${wide ? "max-w-6xl" : "max-w-5xl"}`}
      aria-busy="true"
      aria-label="Memuat"
    >
      <div className="mb-6 h-4 w-48 rounded bg-surface" />
      <div className="mb-10 h-9 w-2/3 max-w-md rounded bg-surface" />
      <div className="border-t border-rule">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-rule px-2 py-4">
            <div className="h-4 flex-1 rounded bg-surface" style={{ maxWidth: `${60 + ((i * 17) % 35)}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
