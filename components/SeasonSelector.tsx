"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { SeasonRef } from "@/lib/season";
import { SEASONS, nextSeason, prevSeason, seasonLabel, seasonSlug } from "@/lib/season";

export default function SeasonSelector({ current }: { current: SeasonRef }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const withQuery = (slug: string) => `/chart/${slug}${query ? `?${query}` : ""}`;

  function go(ref: SeasonRef) {
    router.push(withQuery(seasonSlug(ref)));
  }

  const years = Array.from({ length: 8 }, (_, i) => current.year + 2 - i);

  return (
    <div className="flex items-center gap-2">
      <Link
        href={withQuery(seasonSlug(prevSeason(current)))}
        aria-label="Previous season"
        className="glass rounded-lg px-3 py-2 text-sm transition-shadow hover:glow-accent"
      >
        ←
      </Link>

      <select
        aria-label="Season"
        value={current.season}
        onChange={(e) => go({ ...current, season: e.target.value as SeasonRef["season"] })}
        className="px-3 py-2 text-sm font-semibold"
      >
        {SEASONS.map((s) => (
          <option key={s} value={s}>
            {seasonLabel({ season: s, year: current.year }).split(" ")[0]}
          </option>
        ))}
      </select>

      <select
        aria-label="Year"
        value={current.year}
        onChange={(e) => go({ ...current, year: Number(e.target.value) })}
        className="px-3 py-2 text-sm font-semibold"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <Link
        href={withQuery(seasonSlug(nextSeason(current)))}
        aria-label="Next season"
        className="glass rounded-lg px-3 py-2 text-sm transition-shadow hover:glow-accent"
      >
        →
      </Link>
    </div>
  );
}
