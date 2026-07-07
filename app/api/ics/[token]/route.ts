import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userPrefs } from "@/lib/db/schema";
import { fetchMediaByIds } from "@/lib/anilist/media";
import { displayTitle } from "@/lib/anilist/types";
import { getTrackedList } from "@/lib/list";

function icsDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/**
 * Tokened calendar feed (no cookies — calendar apps can subscribe to it).
 * One VEVENT per tracked anime's next episode; the feed refreshes on each
 * fetch, so subscribed calendars always show upcoming episodes.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[a-f0-9]{40}$/.test(token)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const [prefsRow] = await db.select().from(userPrefs).where(eq(userPrefs.icsToken, token));
  if (!prefsRow) return new NextResponse("Not found", { status: 404 });

  const rows = await getTrackedList(prefsRow.userId);
  const mediaMap = await fetchMediaByIds(rows.map((r) => r.mediaId));

  const events: string[] = [];
  for (const row of rows) {
    const media = mediaMap.get(row.mediaId);
    const next = media?.nextAiringEpisode;
    if (!media || !next) continue;

    const title = displayTitle(media);
    const durationMin = 30;
    events.push(
      [
        "BEGIN:VEVENT",
        `UID:anitick-${row.mediaId}-${next.episode}@anitick`,
        `DTSTAMP:${icsDate(Math.floor(Date.now() / 1000))}`,
        `DTSTART:${icsDate(next.airingAt)}`,
        `DTEND:${icsDate(next.airingAt + durationMin * 60)}`,
        `SUMMARY:${escapeText(`${title} — Episode ${next.episode}`)}`,
        `URL:https://anilist.co/anime/${row.mediaId}`,
        "END:VEVENT",
      ].join("\r\n"),
    );
  }

  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//AniTick//Anime Airing Schedule//EN",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:AniTick — Anime Episodes",
    ...events,
    "END:VCALENDAR",
    "",
  ].join("\r\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="anitick.ics"',
      "Cache-Control": "no-store",
    },
  });
}
