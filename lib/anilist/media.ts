import { fetchAniList } from "@/lib/anilist/client";
import { MEDIA_BY_IDS_QUERY } from "@/lib/anilist/queries";
import type { MediaCard } from "@/lib/anilist/types";

interface MediaByIdsData {
  Page: { media: MediaCard[] };
}

const TTL = 15 * 60 * 1000;

/**
 * Fetch many media by AniList id (50 per request, cached per chunk).
 * Returns a map keyed by media id; ids AniList doesn't know are absent.
 */
export async function fetchMediaByIds(ids: number[]): Promise<Map<number, MediaCard>> {
  const unique = [...new Set(ids)].sort((a, b) => a - b);
  const chunks: number[][] = [];
  for (let i = 0; i < unique.length; i += 50) {
    chunks.push(unique.slice(i, i + 50));
  }

  const results = await Promise.all(
    chunks.map((chunk) => fetchAniList<MediaByIdsData>(MEDIA_BY_IDS_QUERY, { ids: chunk }, TTL)),
  );

  const map = new Map<number, MediaCard>();
  for (const result of results) {
    for (const media of result.Page.media) {
      map.set(media.id, media);
    }
  }
  return map;
}
