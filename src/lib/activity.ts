// Calendar maths for the activity graph. Days are Asia/Jakarta calendar days as
// YYYY-MM-DD strings; weeks start on Monday (Senin).

const DAY_MS = 86_400_000;

export function jakartaToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date());
}

function toDate(day: string) {
  return new Date(`${day}T00:00:00Z`);
}

function addDays(day: string, n: number) {
  return new Date(toDate(day).getTime() + n * DAY_MS).toISOString().slice(0, 10);
}

/** Monday of the week containing `day` */
function weekStart(day: string) {
  const weekday = (toDate(day).getUTCDay() + 6) % 7; // Mon = 0
  return addDays(day, -weekday);
}

export function activityRange(weeks: number) {
  const today = jakartaToday();
  return { today, start: addDays(weekStart(today), -(weeks - 1) * 7) };
}

export interface ActivityDay {
  day: string;
  seconds: number;
  future: boolean;
}

/** Columns of 7 days (Mon..Sun) from `start` through the week of `today`. */
export function buildWeeks(start: string, today: string, rows: { day: Date | string; seconds: number }[]) {
  const byDay = new Map(rows.map((r) => [new Date(r.day).toISOString().slice(0, 10), r.seconds]));
  const weeks: ActivityDay[][] = [];
  for (let d = start; d <= addDays(weekStart(today), 6); d = addDays(d, 7)) {
    weeks.push(
      Array.from({ length: 7 }, (_, i) => {
        const day = addDays(d, i);
        return { day, seconds: byDay.get(day) ?? 0, future: day > today };
      }),
    );
  }
  return { weeks, byDay };
}

/** Consecutive days with at least a minute of watching, counting back from today
 *  (or from yesterday if nothing has been watched yet today). */
export function currentStreak(byDay: Map<string, number>, today: string) {
  const active = (d: string) => (byDay.get(d) ?? 0) >= 60;
  let day = active(today) ? today : addDays(today, -1);
  let streak = 0;
  while (active(day)) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

export function secondsThisWeek(byDay: Map<string, number>, today: string) {
  let total = 0;
  for (let d = weekStart(today); d <= today; d = addDays(d, 1)) total += byDay.get(d) ?? 0;
  return total;
}
