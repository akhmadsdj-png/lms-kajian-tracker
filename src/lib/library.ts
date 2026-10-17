// Turns raw progress rows into "Pustaka kamu": the playlists a user has started,
// most recently watched first, with per-playlist completion counts.

interface ProgressRow {
  isCompleted: boolean;
  lastWatchedSeconds: number;
  updatedAt: Date | string;
  video: { playlistId: string; durationSeconds: number | null };
}

export function summarizeProgress(rows: ProgressRow[]) {
  const completedByPlaylist = new Map<string, number>();
  const lastActivityByPlaylist = new Map<string, number>();
  let secondsWatched = 0;
  let inProgress = 0;

  for (const r of rows) {
    const id = r.video.playlistId;
    const at = new Date(r.updatedAt).getTime();
    lastActivityByPlaylist.set(id, Math.max(lastActivityByPlaylist.get(id) ?? 0, at));
    if (r.isCompleted) {
      completedByPlaylist.set(id, (completedByPlaylist.get(id) ?? 0) + 1);
      secondsWatched += r.video.durationSeconds ?? r.lastWatchedSeconds;
    } else {
      secondsWatched += r.lastWatchedSeconds;
      if (r.lastWatchedSeconds > 0) inProgress++;
    }
  }

  return { completedByPlaylist, lastActivityByPlaylist, secondsWatched, inProgress };
}

export function followedPlaylists<T extends { id: string }>(
  playlists: T[],
  lastActivityByPlaylist: Map<string, number>,
): T[] {
  return playlists
    .filter((p) => lastActivityByPlaylist.has(p.id))
    .sort((a, b) => lastActivityByPlaylist.get(b.id)! - lastActivityByPlaylist.get(a.id)!);
}
