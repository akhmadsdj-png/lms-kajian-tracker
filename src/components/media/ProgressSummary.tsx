import { LoginButton } from "@/components/LoginButton";

export interface ProgressStats {
  completed: number;
  inProgress: number;
  secondsWatched: number;
  playlistsFollowed: number;
  /** Total pertemuan across the playlists the user has started */
  followedTotal: number;
}

export function ProgressSummary({ stats }: { stats: ProgressStats | null }) {
  if (!stats) {
    return (
      <section className="mt-8 flex flex-col gap-4 rounded-2xl bg-surface p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="font-sans text-xl font-bold">Progres kamu</h2>
          <p className="mt-1 text-pencil">
            Masuk untuk melihat pertemuan yang sudah selesai, jam belajar, dan playlist yang kamu ikuti.
          </p>
        </div>
        <div className="shrink-0">
          <LoginButton />
        </div>
      </section>
    );
  }

  const hours = stats.secondsWatched / 3600;
  const percent = stats.followedTotal > 0 ? (stats.completed / stats.followedTotal) * 100 : 0;

  const items = [
    { label: "Pertemuan selesai", value: stats.completed.toLocaleString("id-ID") },
    { label: "Sedang ditonton", value: stats.inProgress.toLocaleString("id-ID") },
    {
      label: "Jam belajar",
      value: hours >= 10 ? Math.round(hours).toLocaleString("id-ID") : hours.toLocaleString("id-ID", { maximumFractionDigits: 1 }),
    },
    { label: "Playlist diikuti", value: stats.playlistsFollowed.toLocaleString("id-ID") },
  ];

  return (
    <section className="mt-8 rounded-2xl bg-surface p-5 sm:p-6" aria-labelledby="progress-summary">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id="progress-summary" className="font-sans text-xl font-bold">
          Progres kamu
        </h2>
        {stats.followedTotal > 0 && (
          <p className="text-sm tabular-nums text-pencil">
            {stats.completed} dari {stats.followedTotal.toLocaleString("id-ID")} pertemuan di playlist yang
            kamu ikuti
          </p>
        )}
      </div>

      {stats.followedTotal > 0 && (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-raised" aria-hidden>
          <div className="h-full rounded-full bg-pen" style={{ width: `${Math.max(percent, 1)}%` }} />
        </div>
      )}

      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col-reverse">
            <dt className="mt-0.5 text-sm text-pencil">{item.label}</dt>
            <dd className="text-3xl font-bold tabular-nums sm:text-4xl">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
