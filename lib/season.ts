import type { MediaSeason } from "@/lib/anilist/types";

export const SEASONS: MediaSeason[] = ["WINTER", "SPRING", "SUMMER", "FALL"];

export interface SeasonRef {
  season: MediaSeason;
  year: number;
}

export function currentSeason(date = new Date()): SeasonRef {
  const month = date.getMonth() + 1;
  const season: MediaSeason =
    month <= 3 ? "WINTER" : month <= 6 ? "SPRING" : month <= 9 ? "SUMMER" : "FALL";
  return { season, year: date.getFullYear() };
}

export function nextSeason({ season, year }: SeasonRef): SeasonRef {
  const i = SEASONS.indexOf(season);
  return i === SEASONS.length - 1
    ? { season: SEASONS[0], year: year + 1 }
    : { season: SEASONS[i + 1], year };
}

export function prevSeason({ season, year }: SeasonRef): SeasonRef {
  const i = SEASONS.indexOf(season);
  return i === 0
    ? { season: SEASONS[SEASONS.length - 1], year: year - 1 }
    : { season: SEASONS[i - 1], year };
}

/** "summer-2026" -> { season: "SUMMER", year: 2026 } */
export function parseSeasonSlug(slug: string): SeasonRef | null {
  const match = /^(winter|spring|summer|fall)-(\d{4})$/i.exec(slug);
  if (!match) return null;
  return {
    season: match[1].toUpperCase() as MediaSeason,
    year: Number(match[2]),
  };
}

export function seasonSlug({ season, year }: SeasonRef): string {
  return `${season.toLowerCase()}-${year}`;
}

export function seasonLabel({ season, year }: SeasonRef): string {
  return `${season.charAt(0)}${season.slice(1).toLowerCase()} ${year}`;
}

// AniList's genre collection is stable; hardcoding avoids an extra API call.
export const GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Ecchi",
  "Fantasy",
  "Horror",
  "Mahou Shoujo",
  "Mecha",
  "Music",
  "Mystery",
  "Psychological",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
];

export const FORMATS = ["TV", "TV_SHORT", "MOVIE", "OVA", "ONA", "SPECIAL"] as const;

export const CHART_SORTS = {
  POPULARITY_DESC: "Popularity",
  SCORE_DESC: "Score",
  TITLE_ROMAJI: "Title",
  START_DATE: "Start date",
} as const;

export type ChartSort = keyof typeof CHART_SORTS;
