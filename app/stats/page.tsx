import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { fetchAniListAuthed } from "@/lib/anilist/client";
import { getConnection } from "@/lib/anilist/connection";
import { fetchMediaByIds } from "@/lib/anilist/media";
import { USER_STATS_QUERY } from "@/lib/anilist/queries";
import { getTrackedList } from "@/lib/list";
import { getUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Stats" };

interface Stats {
  source: "anilist" | "app";
  count: number;
  episodesWatched: number;
  hoursWatched: number;
  meanScore: number | null;
  completionRate: number | null; // 0–100
  statuses: { label: string; count: number }[];
  genres: { genre: string; count: number }[];
}

interface AniListStatsData {
  User: {
    statistics: {
      anime: {
        count: number;
        episodesWatched: number;
        minutesWatched: number;
        meanScore: number;
        statuses: { status: string; count: number }[];
        genres: { genre: string; count: number }[];
      };
    };
  } | null;
}

const STATUS_LABELS: Record<string, string> = {
  CURRENT: "Watching",
  PLANNING: "Planning",
  COMPLETED: "Completed",
  PAUSED: "Paused",
  DROPPED: "Dropped",
  REPEATING: "Rewatching",
  watching: "Watching",
  planning: "Planning",
  completed: "Completed",
  other: "Other",
};

async function anilistStats(userId: string): Promise<Stats | null> {
  const connection = await getConnection(userId);
  if (!connection) return null;

  try {
    const data = await fetchAniListAuthed<AniListStatsData>(
      connection.accessToken,
      USER_STATS_QUERY,
      { userId: connection.anilistUserId },
    );
    const anime = data.User?.statistics.anime;
    if (!anime) return null;

    const completed = anime.statuses.find((s) => s.status === "COMPLETED")?.count ?? 0;
    return {
      source: "anilist",
      count: anime.count,
      episodesWatched: anime.episodesWatched,
      hoursWatched: Math.round(anime.minutesWatched / 60),
      meanScore: anime.meanScore || null,
      completionRate: anime.count > 0 ? Math.round((completed / anime.count) * 100) : null,
      statuses: anime.statuses.map((s) => ({
        label: STATUS_LABELS[s.status] ?? s.status,
        count: s.count,
      })),
      genres: anime.genres,
    };
  } catch {
    return null; // token expired etc. — fall back to app-side stats
  }
}

async function appStats(userId: string): Promise<Stats> {
  const rows = await getTrackedList(userId);
  const mediaMap = await fetchMediaByIds(rows.map((r) => r.mediaId));

  const statusCounts = new Map<string, number>();
  const genreCounts = new Map<string, number>();
  let episodesWatched = 0;
  let minutesWatched = 0;

  for (const row of rows) {
    statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + 1);
    const media = mediaMap.get(row.mediaId);
    if (!media) continue;
    for (const genre of media.genres) {
      genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
    }
    if (row.status === "completed") {
      const eps = media.episodes ?? 0;
      episodesWatched += eps;
      minutesWatched += eps * 24; // typical episode length when AniList lacks duration
    }
  }

  const completed = statusCounts.get("completed") ?? 0;
  return {
    source: "app",
    count: rows.length,
    episodesWatched,
    hoursWatched: Math.round(minutesWatched / 60),
    meanScore: null,
    completionRate: rows.length > 0 ? Math.round((completed / rows.length) * 100) : null,
    statuses: [...statusCounts.entries()]
      .map(([status, count]) => ({ label: STATUS_LABELS[status] ?? status, count }))
      .sort((a, b) => b.count - a.count),
    genres: [...genreCounts.entries()]
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12),
  };
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-3xl font-bold tabular-nums text-accent-strong">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}

function BarList({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <section className="glass rounded-2xl p-5">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">No data yet.</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {rows.map(({ label, count }) => (
            <li key={label} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-3">
              <span className="truncate text-sm">{label}</span>
              <span className="h-2.5 overflow-hidden rounded-full bg-surface-raised">
                <span
                  className="block h-full rounded-full bg-accent"
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </span>
              <span className="text-right text-sm tabular-nums text-muted">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function StatsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const stats = (await anilistStats(user.id)) ?? (await appStats(user.id));

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-1 text-2xl font-bold">Stats</h1>
      <p className="mb-8 text-sm text-muted">
        {stats.source === "anilist"
          ? "Lifetime stats from your connected AniList account."
          : "Calculated from your AniTick tracked list. Connect AniList in Settings for lifetime stats."}
      </p>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Total anime" value={String(stats.count)} />
        <StatTile label="Episodes watched" value={stats.episodesWatched.toLocaleString()} />
        <StatTile label="Hours watched" value={stats.hoursWatched.toLocaleString()} />
        {stats.meanScore !== null ? (
          <StatTile label="Mean score" value={`${stats.meanScore}`} />
        ) : (
          <StatTile
            label="Completion rate"
            value={stats.completionRate !== null ? `${stats.completionRate}%` : "—"}
          />
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <BarList
          title="Genre breakdown"
          rows={stats.genres.map((g) => ({ label: g.genre, count: g.count }))}
        />
        <BarList title="By status" rows={stats.statuses} />
      </div>
    </div>
  );
}
