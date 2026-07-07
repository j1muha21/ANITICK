import Link from "next/link";
import AnimeCard from "@/components/AnimeCard";
import { fetchAniList } from "@/lib/anilist/client";
import { AIRING_TODAY_QUERY, SEASONAL_QUERY, TRENDING_QUERY } from "@/lib/anilist/queries";
import type { AiringScheduleItem, MediaCard, PageInfo } from "@/lib/anilist/types";
import { getTrackedIds } from "@/lib/list";
import { getUser } from "@/lib/session";
import { currentSeason, nextSeason, seasonLabel, seasonSlug } from "@/lib/season";

export const dynamic = "force-dynamic";

interface TrendingData {
  Page: { media: MediaCard[] };
}
interface AiringData {
  Page: { airingSchedules: AiringScheduleItem[] };
}
interface SeasonalData {
  Page: { pageInfo: PageInfo; media: MediaCard[] };
}

function Section({
  title,
  subtitle,
  href,
  children,
}: {
  title: string;
  subtitle?: string;
  href?: { label: string; url: string };
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
        {href && (
          <Link href={href.url} className="text-sm text-accent hover:underline">
            {href.label} →
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {children}
      </div>
    </section>
  );
}

export default async function HomePage() {
  // Rounded to 15-min buckets so the cache key stays stable between renders.
  const now = Math.floor(Date.now() / 1000 / 900) * 900;
  const upcoming = nextSeason(currentSeason());

  const [user, trending, airing, seasonal] = await Promise.all([
    getUser(),
    fetchAniList<TrendingData>(TRENDING_QUERY, { perPage: 18 }),
    fetchAniList<AiringData>(AIRING_TODAY_QUERY, { from: now, to: now + 86400, perPage: 50 }),
    fetchAniList<SeasonalData>(SEASONAL_QUERY, {
      page: 1,
      season: upcoming.season,
      seasonYear: upcoming.year,
      sort: ["POPULARITY_DESC"],
    }),
  ]);

  // One card per show even if multiple episodes air in the window.
  const seen = new Set<number>();
  const airingToday = airing.Page.airingSchedules.filter(({ media }) => {
    if (!media || media.isAdult || seen.has(media.id)) return false;
    seen.add(media.id);
    return true;
  });

  const canAdd = Boolean(user);
  const trackedIds = new Set(user ? await getTrackedIds(user.id) : []);

  return (
    <>
      <Section title="Airing Today" subtitle="Episodes releasing in the next 24 hours">
        {airingToday.slice(0, 12).map(({ media }) => (
          <AnimeCard key={media.id} media={media} canAddToList={canAdd} tracked={trackedIds.has(media.id)} />
        ))}
      </Section>

      <Section title="Trending Now" subtitle="Most talked-about airing anime">
        {trending.Page.media.map((media) => (
          <AnimeCard key={media.id} media={media} canAddToList={canAdd} tracked={trackedIds.has(media.id)} />
        ))}
      </Section>

      <Section
        title={`Upcoming: ${seasonLabel(upcoming)}`}
        subtitle="Most anticipated shows of next season"
        href={{ label: "Full chart", url: `/chart/${seasonSlug(upcoming)}` }}
      >
        {seasonal.Page.media.slice(0, 12).map((media) => (
          <AnimeCard key={media.id} media={media} canAddToList={canAdd} tracked={trackedIds.has(media.id)} />
        ))}
      </Section>
    </>
  );
}
