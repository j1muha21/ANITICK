import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AnimeCard from "@/components/AnimeCard";
import AnimeListRow from "@/components/AnimeListRow";
import ChartFilters from "@/components/ChartFilters";
import SeasonSelector from "@/components/SeasonSelector";
import { fetchAniList } from "@/lib/anilist/client";
import { SEASONAL_QUERY } from "@/lib/anilist/queries";
import type { MediaCard, PageInfo } from "@/lib/anilist/types";
import type { ChartSort, SeasonRef } from "@/lib/season";
import { CHART_SORTS, FORMATS, GENRES, currentSeason, parseSeasonSlug, seasonLabel } from "@/lib/season";

export const dynamic = "force-dynamic";

interface SeasonalData {
  Page: { pageInfo: PageInfo; media: MediaCard[] };
}

const MAX_PAGES = 6;
const CHART_TTL = 30 * 60 * 1000;

async function fetchSeason(
  ref: SeasonRef,
  format: string | null,
  genre: string | null,
  sort: ChartSort,
): Promise<MediaCard[]> {
  const all: MediaCard[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const data = await fetchAniList<SeasonalData>(
      SEASONAL_QUERY,
      {
        page,
        season: ref.season,
        seasonYear: ref.year,
        ...(format ? { format: [format] } : {}),
        ...(genre ? { genre } : {}),
        sort: [sort],
      },
      CHART_TTL,
    );
    all.push(...data.Page.media);
    if (!data.Page.pageInfo.hasNextPage) break;
  }
  return all;
}

function resolveSeason(slugParts: string[] | undefined): SeasonRef | null {
  if (!slugParts || slugParts.length === 0) return currentSeason();
  if (slugParts.length !== 1) return null;
  return parseSeasonSlug(slugParts[0]);
}

interface PageProps {
  params: Promise<{ season?: string[] }>;
  searchParams: Promise<{ format?: string; genre?: string; sort?: string; view?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { season } = await params;
  const ref = resolveSeason(season);
  return { title: ref ? `${seasonLabel(ref)} Chart` : "Seasonal Chart" };
}

export default async function ChartPage({ params, searchParams }: PageProps) {
  const [{ season }, query] = await Promise.all([params, searchParams]);

  const ref = resolveSeason(season);
  if (!ref) notFound();

  const format = query.format && (FORMATS as readonly string[]).includes(query.format) ? query.format : null;
  const genre = query.genre && GENRES.includes(query.genre) ? query.genre : null;
  const sort: ChartSort =
    query.sort && query.sort in CHART_SORTS ? (query.sort as ChartSort) : "POPULARITY_DESC";
  const view = query.view === "list" ? "list" : "grid";

  const media = await fetchSeason(ref, format, genre, sort);
  // Add-to-list buttons return with the DB-backed tracked list (Stage 3).
  const canAdd = false;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{seasonLabel(ref)}</h1>
          <p className="text-sm text-muted">
            {media.length} anime this season
          </p>
        </div>
        <SeasonSelector current={ref} />
      </div>

      <div className="mb-6">
        <ChartFilters />
      </div>

      {media.length === 0 ? (
        <p className="py-16 text-center text-muted">
          Nothing found for this season with the current filters.
        </p>
      ) : view === "list" ? (
        <div className="flex flex-col gap-2">
          {media.map((m) => (
            <AnimeListRow key={m.id} media={m} canAddToList={canAdd} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {media.map((m) => (
            <AnimeCard key={m.id} media={m} canAddToList={canAdd} />
          ))}
        </div>
      )}
    </div>
  );
}
