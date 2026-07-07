import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CountdownTimer from "@/components/CountdownTimer";
import LocalTime from "@/components/LocalTime";
import AddToPlanningButton from "@/components/AddToPlanningButton";
import { formatLabel } from "@/components/AnimeCard";
import { AniListError, fetchAniList } from "@/lib/anilist/client";
import { MEDIA_DETAIL_QUERY } from "@/lib/anilist/queries";
import type { MediaDetail } from "@/lib/anilist/types";
import { displayTitle, mainStudio } from "@/lib/anilist/types";
import { getSession } from "@/lib/session";
import { seasonLabel } from "@/lib/season";

interface DetailData {
  Media: MediaDetail;
}

async function getMedia(id: number): Promise<MediaDetail | null> {
  try {
    const data = await fetchAniList<DetailData>(MEDIA_DETAIL_QUERY, { id }, 30 * 60 * 1000);
    return data.Media;
  } catch (err) {
    if (err instanceof AniListError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const media = await getMedia(Number(id));
  return { title: media ? displayTitle(media) : "Not found" };
}

function stripHtml(text: string): string {
  return text.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");
}

export default async function AnimeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mediaId = Number(id);
  if (!Number.isInteger(mediaId) || mediaId <= 0) notFound();

  const [media, session] = await Promise.all([getMedia(mediaId), getSession()]);
  if (!media) notFound();

  const title = displayTitle(media);
  const cover = media.coverImage.extraLarge ?? media.coverImage.large;
  const next = media.nextAiringEpisode;
  const upcoming = media.airingSchedule.nodes;

  const facts: [string, string | null][] = [
    ["Format", formatLabel(media.format)],
    ["Episodes", media.episodes ? String(media.episodes) : "TBA"],
    ["Duration", media.duration ? `${media.duration} min` : null],
    ["Status", media.status ? media.status.replaceAll("_", " ").toLowerCase() : null],
    [
      "Season",
      media.season && media.seasonYear
        ? seasonLabel({ season: media.season, year: media.seasonYear })
        : null,
    ],
    ["Studio", mainStudio(media)],
    ["Source", media.source ? media.source.replaceAll("_", " ").toLowerCase() : null],
    ["Score", media.averageScore ? `${media.averageScore}%` : null],
  ];

  return (
    <article className="-mx-4 -mt-6">
      {media.bannerImage && (
        <div className="relative h-48 w-full sm:h-64">
          <Image src={media.bannerImage} alt="" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}

      <div className={`mx-auto max-w-5xl px-4 ${media.bannerImage ? "-mt-20 relative" : "pt-6"}`}>
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="w-40 shrink-0 sm:w-52">
            {cover && (
              <Image
                src={cover}
                alt={title}
                width={208}
                height={312}
                className="rounded-xl shadow-lg"
                priority
              />
            )}
            {session && (
              <div className="mt-3">
                <AddToPlanningButton mediaId={media.id} />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 sm:pt-16">
            <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
            {media.title.romaji && media.title.english && (
              <p className="mt-1 text-sm text-muted">{media.title.romaji}</p>
            )}

            {next && (
              <div className="mt-5">
                <p className="mb-2 text-sm font-semibold text-muted">
                  Episode {next.episode} airs in
                </p>
                <CountdownTimer airingAt={next.airingAt} variant="full" />
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {media.genres.map((g) => (
                <span key={g} className="glass rounded-full px-3 py-1 text-xs text-muted">
                  {g}
                </span>
              ))}
            </div>

            {media.description && (
              <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-foreground/85">
                {stripHtml(media.description)}
              </p>
            )}
          </div>
        </div>

        <dl className="glass mt-8 grid grid-cols-2 gap-4 rounded-2xl p-5 sm:grid-cols-4">
          {facts
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs uppercase tracking-wide text-muted">{k}</dt>
                <dd className="mt-0.5 text-sm font-medium capitalize">{v}</dd>
              </div>
            ))}
        </dl>

        {upcoming.length > 0 && (
          <section className="mt-8 pb-4">
            <h2 className="mb-3 text-lg font-bold">Upcoming Episodes</h2>
            <ul className="glass divide-y divide-glass-border overflow-hidden rounded-2xl">
              {upcoming.map((ep) => (
                <li key={ep.episode} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm font-medium">Episode {ep.episode}</span>
                  <div className="flex items-center gap-4">
                    <LocalTime
                      timestamp={ep.airingAt}
                      className="hidden text-xs text-muted sm:inline"
                    />
                    <CountdownTimer airingAt={ep.airingAt} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
