export type MediaSeason = "WINTER" | "SPRING" | "SUMMER" | "FALL";

export type MediaFormat =
  | "TV"
  | "TV_SHORT"
  | "MOVIE"
  | "SPECIAL"
  | "OVA"
  | "ONA"
  | "MUSIC";

export type MediaStatus =
  | "FINISHED"
  | "RELEASING"
  | "NOT_YET_RELEASED"
  | "CANCELLED"
  | "HIATUS";

export interface AiringEpisode {
  airingAt: number; // Unix seconds
  episode: number;
  timeUntilAiring?: number;
}

export interface MediaCard {
  id: number;
  isAdult: boolean;
  title: {
    romaji: string | null;
    english: string | null;
  };
  coverImage: {
    large: string | null;
    extraLarge: string | null;
    color: string | null;
  };
  format: MediaFormat | null;
  episodes: number | null;
  status: MediaStatus | null;
  season: MediaSeason | null;
  seasonYear: number | null;
  genres: string[];
  averageScore: number | null;
  popularity: number | null;
  studios: {
    nodes: { name: string }[];
  };
  nextAiringEpisode: AiringEpisode | null;
  startDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  } | null;
}

export interface MediaDetail extends MediaCard {
  bannerImage: string | null;
  description: string | null;
  duration: number | null;
  source: string | null;
  airingSchedule: {
    nodes: AiringEpisode[];
  };
}

export interface PageInfo {
  currentPage: number;
  hasNextPage: boolean;
}

export interface AiringScheduleItem {
  airingAt: number;
  episode: number;
  media: MediaCard;
}

export interface Viewer {
  id: number;
  name: string;
  avatar: { medium: string | null } | null;
}

export interface MediaListEntry {
  progress: number | null;
  media: MediaCard;
}

export interface MediaListGroup {
  name: string;
  status: "CURRENT" | "PLANNING" | string;
  entries: MediaListEntry[];
}

export function displayTitle(media: Pick<MediaCard, "title">): string {
  return media.title.english ?? media.title.romaji ?? "Untitled";
}

export function mainStudio(media: Pick<MediaCard, "studios">): string | null {
  return media.studios.nodes[0]?.name ?? null;
}
