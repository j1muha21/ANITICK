import { fetchAniList } from "@/lib/anilist/client";
import { CALENDAR_QUERY } from "@/lib/anilist/queries";
import type { PageInfo } from "@/lib/anilist/types";

export interface ScheduleEpisode {
  mediaId: number;
  title: string;
  cover: string | null;
  episode: number;
  airingAt: number; // Unix seconds
}

interface CalendarData {
  Page: {
    pageInfo: PageInfo;
    airingSchedules: {
      airingAt: number;
      episode: number;
      media: {
        id: number;
        title: { romaji: string | null; english: string | null };
        coverImage: { large: string | null };
      } | null;
    }[];
  };
}

const DAY = 86400;
const TTL = 15 * 60 * 1000;
const MAX_PAGES = 6;

/**
 * Every upcoming episode for the given media ids, from ~3 days back to
 * 8 weeks ahead. The window is bucketed to whole days so the cache key
 * stays stable across renders.
 */
export async function fetchAiringCalendar(mediaIds: number[]): Promise<ScheduleEpisode[]> {
  if (mediaIds.length === 0) return [];

  const today = Math.floor(Date.now() / 1000 / DAY) * DAY;
  const from = today - 3 * DAY;
  const to = today + 56 * DAY;
  const ids = [...new Set(mediaIds)].sort((a, b) => a - b);

  const episodes: ScheduleEpisode[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const data = await fetchAniList<CalendarData>(CALENDAR_QUERY, { ids, from, to, page }, TTL);
    for (const node of data.Page.airingSchedules) {
      if (!node.media) continue;
      episodes.push({
        mediaId: node.media.id,
        title: node.media.title.english ?? node.media.title.romaji ?? "Untitled",
        cover: node.media.coverImage.large,
        episode: node.episode,
        airingAt: node.airingAt,
      });
    }
    if (!data.Page.pageInfo.hasNextPage) break;
  }
  return episodes;
}
