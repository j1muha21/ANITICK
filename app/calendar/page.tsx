import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import CalendarWeek, { type CalendarItem } from "@/components/CalendarWeek";
import { fetchMediaByIds } from "@/lib/anilist/media";
import { displayTitle } from "@/lib/anilist/types";
import { getTrackedList } from "@/lib/list";
import { getUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Weekly Calendar" };

export default async function CalendarPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const rows = await getTrackedList(user.id);
  const mediaMap = await fetchMediaByIds(rows.map((r) => r.mediaId));

  const items: CalendarItem[] = [];
  for (const row of rows) {
    const media = mediaMap.get(row.mediaId);
    const next = media?.nextAiringEpisode;
    if (!media || !next) continue;
    items.push({
      mediaId: row.mediaId,
      title: displayTitle(media),
      cover: media.coverImage.large,
      episode: next.episode,
      airingAt: next.airingAt,
    });
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Weekly Calendar</h1>
      <p className="mb-6 text-sm text-muted">
        Which day each of your tracked anime airs, in your local time.
      </p>

      {items.length === 0 ? (
        <p className="glass rounded-2xl p-8 text-center text-sm text-muted">
          No tracked anime with upcoming episodes.{" "}
          <Link href="/chart" className="text-accent-strong hover:underline">
            Add some from the seasonal chart
          </Link>
          .
        </p>
      ) : (
        <CalendarWeek items={items} />
      )}
    </div>
  );
}
