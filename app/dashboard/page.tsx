import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AnimeCard from "@/components/AnimeCard";
import CountdownTimer from "@/components/CountdownTimer";
import TrackedControls from "@/components/TrackedControls";
import { fetchMediaByIds } from "@/lib/anilist/media";
import type { MediaCard } from "@/lib/anilist/types";
import { displayTitle } from "@/lib/anilist/types";
import { getTrackedList, type TrackedRow } from "@/lib/list";
import { getUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My Countdowns" };

interface Item {
  row: TrackedRow;
  media: MediaCard | null;
}

function airingAt(item: Item): number {
  return item.media?.nextAiringEpisode?.airingAt ?? Infinity;
}

function PinnedCard({ item }: { item: Item }) {
  const { row, media } = item;
  const title = media ? displayTitle(media) : row.title;
  const cover = media?.coverImage.large ?? row.coverImage;
  const next = media?.nextAiringEpisode ?? null;

  return (
    <div className="glass glow-accent flex w-64 shrink-0 flex-col overflow-hidden rounded-2xl">
      <Link href={`/anime/${row.mediaId}`} className="relative block h-32 bg-surface-raised">
        {cover && (
          <Image src={cover} alt={title} fill sizes="256px" className="object-cover object-top" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="line-clamp-1 text-sm font-bold">{title}</p>
          {next ? (
            <p className="mt-0.5 flex items-center gap-2 text-xs text-muted">
              Ep {next.episode} · <CountdownTimer airingAt={next.airingAt} />
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-muted">No upcoming episode</p>
          )}
        </div>
      </Link>
      <div className="p-3">
        <TrackedControls mediaId={row.mediaId} pinned={row.pinned} />
      </div>
    </div>
  );
}

function Section({ title, subtitle, items }: { title: string; subtitle: string; items: Item[] }) {
  return (
    <section className="mb-10">
      <div className="mb-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-sm text-muted">{subtitle}</p>
      </div>
      {items.length === 0 ? (
        <p className="glass rounded-2xl p-6 text-sm text-muted">Nothing here yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map(({ row, media }) =>
            media ? (
              <AnimeCard key={row.mediaId} media={media} controls={{ pinned: row.pinned }} />
            ) : (
              <div key={row.mediaId} className="glass flex flex-col justify-between rounded-2xl p-3">
                <p className="text-sm font-semibold">{row.title}</p>
                <TrackedControls mediaId={row.mediaId} pinned={row.pinned} />
              </div>
            ),
          )}
        </div>
      )}
    </section>
  );
}

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const rows = await getTrackedList(user.id);
  const mediaMap = await fetchMediaByIds(rows.map((r) => r.mediaId));

  const items: Item[] = rows
    .map((row) => ({ row, media: mediaMap.get(row.mediaId) ?? null }))
    .sort((a, b) => airingAt(a) - airingAt(b));

  const pinned = items.filter((i) => i.row.pinned);
  const watching = items.filter((i) => i.row.status === "watching");
  const planning = items.filter((i) => i.row.status === "planning");
  const rest = items.filter((i) => !["watching", "planning"].includes(i.row.status));

  return (
    <>
      <h1 className="mb-1 text-2xl font-bold">My Countdowns</h1>
      <p className="mb-8 text-sm text-muted">
        {rows.length === 0
          ? "Your list is empty — add anime from any card to start tracking."
          : `Tracking ${rows.length} anime, soonest episodes first.`}
      </p>

      {rows.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center text-sm text-muted">
          Browse the{" "}
          <Link href="/chart" className="text-accent-strong hover:underline">
            seasonal chart
          </Link>{" "}
          or the{" "}
          <Link href="/" className="text-accent-strong hover:underline">
            countdown feed
          </Link>{" "}
          and hit “+ Add to My List”.
        </div>
      )}

      {pinned.length > 0 && (
        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-accent-strong">★ Pinned</h2>
            <p className="text-sm text-muted">Front and center, always</p>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {pinned.map((item) => (
              <PinnedCard key={item.row.mediaId} item={item} />
            ))}
          </div>
        </section>
      )}

      {rows.length > 0 && (
        <>
          <Section title="Watching" subtitle="Your currently airing shows" items={watching} />
          <Section title="Planning" subtitle="On your plan-to-watch list" items={planning} />
          {rest.length > 0 && (
            <Section title="Everything Else" subtitle="Completed and other statuses" items={rest} />
          )}
        </>
      )}
    </>
  );
}
