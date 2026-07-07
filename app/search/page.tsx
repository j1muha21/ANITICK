import type { Metadata } from "next";
import AnimeCard from "@/components/AnimeCard";
import { fetchAniList } from "@/lib/anilist/client";
import { SEARCH_QUERY } from "@/lib/anilist/queries";
import type { MediaCard } from "@/lib/anilist/types";
import { getTrackedIds } from "@/lib/list";
import { getUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Search" };

interface SearchData {
  Page: { media: MediaCard[] };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim().slice(0, 100);

  const [results, user] = await Promise.all([
    query
      ? fetchAniList<SearchData>(SEARCH_QUERY, { q: query }, 10 * 60 * 1000)
      : Promise.resolve(null),
    getUser(),
  ]);
  const canAdd = Boolean(user);
  const trackedIds = new Set(user ? await getTrackedIds(user.id) : []);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Search</h1>
      <p className="mb-6 text-sm text-muted">
        {query ? (
          <>
            Results for “<span className="text-foreground">{query}</span>”
          </>
        ) : (
          "Look up any anime by name — the whole AniList catalog, not just this season."
        )}
      </p>

      {results &&
        (results.Page.media.length === 0 ? (
          <p className="glass rounded-2xl p-8 text-center text-sm text-muted">
            Nothing found for “{query}”.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {results.Page.media.map((media) => (
              <AnimeCard
                key={media.id}
                media={media}
                canAddToList={canAdd}
                tracked={trackedIds.has(media.id)}
              />
            ))}
          </div>
        ))}
    </div>
  );
}
