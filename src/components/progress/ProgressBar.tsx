interface ProgressBarProps {
  completed: number;
  total: number;
  /** Started but not finished; drawn as a lighter segment after the finished part */
  inProgress?: number;
  className?: string;
}

function percentLabel(completed: number, total: number) {
  if (total === 0 || completed === 0) return "0%";
  if (completed >= total) return "100%";
  const pct = (completed / total) * 100;
  if (pct < 1) return "<1%";
  return `${Math.min(99, Math.round(pct))}%`; // never claim 100% before it's done
}

/** "2/121 selesai … 2%" with a two-tone bar (finished, then half-watched). */
export function ProgressBar({ completed, total, inProgress = 0, className = "" }: ProgressBarProps) {
  const pct = total > 0 ? (completed / total) * 100 : 0;
  const inPct = total > 0 ? (inProgress / total) * 100 : 0;
  // Keep a sliver visible once anything is done, even 1 of 700
  const doneWidth = completed > 0 ? Math.max(pct, 1.5) : 0;
  const halfWidth = inProgress > 0 ? Math.max(inPct, 1.5) : 0;

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3 text-sm tabular-nums">
        <span>
          <b className="font-semibold text-ink">
            {completed}/{total}
          </b>{" "}
          <span className="text-pencil">
            selesai{inProgress > 0 && `, ${inProgress} belum tuntas`}
          </span>
        </span>
        <span className="font-semibold text-pen">{percentLabel(completed, total)}</span>
      </div>
      <div
        role="progressbar"
        aria-label="Pertemuan selesai"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={completed}
        aria-valuetext={`${completed} dari ${total} pertemuan selesai`}
        className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-raised"
      >
        <span className="h-full bg-pen" style={{ width: `${doneWidth}%` }} />
        <span className="h-full bg-pen/45" style={{ width: `${halfWidth}%` }} />
      </div>
    </div>
  );
}
