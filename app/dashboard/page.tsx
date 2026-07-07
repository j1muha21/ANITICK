import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AnimeCard from "@/components/AnimeCard";
import { AniListError, fetchAniListAuthed } from "@/lib/anilist/client";
import { MEDIA_LIST_QUERY } from "@/lib/anilist/queries";
import type { MediaCard, MediaListGroup } from "@/lib/anilist/types";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My Countdowns" };

interface ListData {
  MediaListCollection: { lists: MediaListGroup[] };
}

function byNextAiring(a: MediaCard, b: MediaCard): number {
  const at = a.nextAiringEpisode?.airingAt ?? Infinity;
  const bt = b.nextAiringEpisode?.airingAt ?? Infinity;
  return at - bt;
}

function Section({ title, subtitle, media }: { title: string; subtitle: string; media: MediaCard[] }) {
  return (
    <section className="mb-10">
      <div className="mb-4">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="text-sm text-muted">{subtitle}</p>
      </div>
      {media.length === 0 ? (
        <p className="rounded-xl bg-surface p-6 text-sm text-muted">Nothing here yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {media.map((m) => (
            <AnimeCard key={m.id} media={m} />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/api/auth/login");

  let lists: MediaListGroup[];
  try {
    const data = await fetchAniListAuthed<ListData>(session.accessToken, MEDIA_LIST_QUERY, {
      userId: session.userId,
    });
    lists = data.MediaListCollection.lists;
  } catch (err) {
    // An expired/revoked token comes back as 400/401 — send them through login again.
    if (err instanceof AniListError && (err.status === 400 || err.status === 401)) {
      redirect("/api/auth/login");
    }
    throw err;
  }

  const entriesFor = (status: string): MediaCard[] =>
    lists
      .filter((l) => l.status === status)
      .flatMap((l) => l.entries.map((e) => e.media))
      .sort(byNextAiring);

  const watching = entriesFor("CURRENT");
  const planning = entriesFor("PLANNING");

  return (
    <>
      <h1 className="mb-1 text-2xl font-bold">My Countdowns</h1>
      <p className="mb-8 text-sm text-muted">
        Synced from {session.userName}&apos;s AniList — shows with the soonest episodes first.
      </p>

      <Section
        title="Watching"
        subtitle="Your currently airing shows"
        media={watching}
      />
      <Section
        title="Planning"
        subtitle="On your plan-to-watch list"
        media={planning}
      />
    </>
  );
}
