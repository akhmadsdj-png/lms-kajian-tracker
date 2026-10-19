import type { ActivityDay } from "@/lib/activity";

const DAY_LABELS = ["Sen", "", "Rab", "", "Jum", "", ""];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// Minutes → shade; 0 stays the empty tile colour
function level(seconds: number) {
  const minutes = seconds / 60;
  if (minutes < 1) return "bg-raised";
  if (minutes < 15) return "bg-pen/30";
  if (minutes < 30) return "bg-pen/55";
  if (minutes < 60) return "bg-pen/80";
  return "bg-pen";
}

function describe(d: ActivityDay) {
  const date = new Date(`${d.day}T00:00:00Z`).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
  const minutes = Math.round(d.seconds / 60);
  return `${date}: ${minutes > 0 ? `${minutes} menit` : "belum ada"}`;
}

/** GitHub-style grid: one column per week (Mon at top), one tile per day. */
export function ActivityGraph({ weeks }: { weeks: ActivityDay[][] }) {
  // Month label above the first week that starts in a new month
  const monthLabels = weeks.map((week, i) => {
    const month = Number(week[0].day.slice(5, 7)) - 1;
    const prev = i > 0 ? Number(weeks[i - 1][0].day.slice(5, 7)) - 1 : -1;
    return month !== prev ? MONTHS[month] : "";
  });

  return (
    <div className="no-scrollbar overflow-x-auto">
      <div className="inline-grid grid-flow-col gap-1" style={{ gridTemplateRows: "auto repeat(7, 1rem)" }}>
        {/* day-name column */}
        <span />
        {DAY_LABELS.map((label, i) => (
          <span key={i} className="pr-1 text-[10px] leading-4 text-pencil">
            {label}
          </span>
        ))}
        {weeks.map((week, w) => [
          <span key={`m${w}`} className="h-4 w-4 overflow-visible text-[10px] whitespace-nowrap text-pencil">
            {monthLabels[w]}
          </span>,
          ...week.map((d) =>
            d.future ? (
              <span key={d.day} className="h-4 w-4" />
            ) : (
              <span
                key={d.day}
                title={describe(d)}
                aria-label={describe(d)}
                className={`h-4 w-4 rounded-[3px] ${level(d.seconds)}`}
              />
            ),
          ),
        ])}
      </div>

      <p className="mt-2 flex items-center gap-1 text-xs text-pencil">
        Sedikit
        {["bg-raised", "bg-pen/30", "bg-pen/55", "bg-pen/80", "bg-pen"].map((c) => (
          <span key={c} className={`h-3 w-3 rounded-[3px] ${c}`} />
        ))}
        Banyak
      </p>
    </div>
  );
}
