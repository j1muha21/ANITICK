import NotificationScheduler, { type UpcomingAiring } from "@/components/NotificationScheduler";
import { fetchMediaByIds } from "@/lib/anilist/media";
import { displayTitle } from "@/lib/anilist/types";
import { getTrackedList } from "@/lib/list";
import { getPrefs } from "@/lib/prefs";
import { getUser } from "@/lib/session";

/** Server shell: loads upcoming airings only when the user opted in. */
export default async function NotificationsProvider() {
  // Notifications are an enhancement — they must never take a page down,
  // so any failure (DB hiccup, AniList rate limit) degrades to "none".
  try {
    const user = await getUser();
    if (!user) return null;

    const prefs = await getPrefs(user.id);
    if (!prefs.notifyEnabled) return null;

    const rows = await getTrackedList(user.id);
    if (rows.length === 0) return null;

    const mediaMap = await fetchMediaByIds(rows.map((r) => r.mediaId));
    const airings: UpcomingAiring[] = [];
    for (const row of rows) {
      const media = mediaMap.get(row.mediaId);
      const next = media?.nextAiringEpisode;
      if (!media || !next) continue;
      airings.push({
        mediaId: row.mediaId,
        title: displayTitle(media),
        episode: next.episode,
        airingAt: next.airingAt,
      });
    }

    return <NotificationScheduler airings={airings} leadMin={prefs.notifyLeadMin} />;
  } catch (err) {
    console.error("NotificationsProvider degraded to none:", err);
    return null;
  }
}
