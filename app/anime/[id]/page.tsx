import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CountdownTimer from "@/components/CountdownTimer";
import LocalTime from "@/components/LocalTime";
import AddToListButton from "@/components/AddToListButton";
import ScreensaverTimer from "@/components/timers/ScreensaverTimer";
import { formatLabel, suggestedStatus } from "@/components/AnimeCard";
import { AniListError, fetchAniList } from "@/lib/anilist/client";
import { MEDIA_DETAIL_QUERY } from "@/lib/anilist/queries";
import type { MediaDetail } from "@/lib/anilist/types";
import { displayTitle, mainStudio } from "@/lib/anilist/types";
import { getTrackedIds } from "@/lib/list";
import { getPrefs } from "@/lib/prefs";
import { getUser } from "@/lib/session";
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

  const [media, user] = await Promise.all([getMedia(mediaId), getUser()]);
  if (!media) notFound();

  const [tracked, prefs] = await Promise.all([
    user ? getTrackedIds(user.id).then((ids) => ids.includes(mediaId)) : false,
    user ? getPrefs(user.id) : null,
  ]);

  const title = displayTitle(media);
  const cover = media.coverImage.extraLarge ?? media.coverImage.large;
  const backdrop = media.bannerImage ?? cover;
  const next = media.nextAiringEpisode;
  const upcoming = media.airingSchedule.nodes;

  const statusLine =
    media.status === "FINISHED"
      ? "Finished airing"
      : media.status === "NOT_YET_RELEASED"
        ? "Not yet released — no air date announced"
        : media.status === "CANCELLED"
          ? "Cancelled"
          : media.status === "HIATUS"
            ? "On hiatus"
            : "No upcoming episode scheduled";

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
      {/* ------------------------------------------------------------------ */}
      {/* Screensaver hero: poster on top, big ambient timer underneath       */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative flex min-h-[88vh] flex-col items-center justify-center overflow-hidden px-4 py-14">
        {backdrop && (
          <div className="absolute inset-0 -z-10">
            <Image
              src={backdrop}
              alt=""
              fill
              priority
              sizes="100vw"
              className="scale-110 object-cover opacity-40 blur-2xl saturate-150"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
          </div>
        )}

        {cover && (
          <Image
            src={cover}
            alt={title}
            width={224}
            height={336}
            priority
            className="glow-accent-strong w-44 rounded-2xl border border-glass-border sm:w-56"
          />
        )}

        <h1 className="mt-6 max-w-3xl text-center text-2xl font-bold sm:text-4xl">{title}</h1>
        {media.title.romaji && media.title.english && (
          <p className="mt-1 text-center text-sm text-muted">{media.title.romaji}</p>
        )}

        <div className="mt-8 w-full max-w-2xl">
          {next ? (
            <>
              <p className="mb-6 text-center text-sm font-semibold uppercase tracking-[0.25em] text-muted">
                Episode {next.episode} airs in
              </p>
              <ScreensaverTimer
                airingAt={next.airingAt}
                defaultStyle={prefs?.timerStyle ?? "digital"}
                persist={Boolean(user)}
              />
            </>
          ) : (
            <p className="text-center text-lg text-muted">{statusLine}</p>
          )}
        </div>

        {user && (
          <div className="mt-8 w-52">
            <AddToListButton
              mediaId={media.id}
              title={title}
              coverImage={media.coverImage.large}
              status={suggestedStatus(media)}
              tracked={tracked}
            />
          </div>
        )}

        <a
          href="#details"
          className="absolute bottom-5 text-xs uppercase tracking-widest text-muted transition-colors hover:text-foreground"
        >
          ↓ details
        </a>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Details below the fold                                              */}
      {/* ------------------------------------------------------------------ */}
      <div id="details" className="mx-auto max-w-5xl px-4 pb-10 pt-6">
        <div className="flex flex-wrap justify-center gap-2">
          {media.genres.map((g) => (
            <span key={g} className="glass rounded-full px-3 py-1 text-xs text-muted">
              {g}
            </span>
          ))}
        </div>

        {media.description && (
          <p className="mx-auto mt-6 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-foreground/85">
            {stripHtml(media.description)}
          </p>
        )}

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
          <section className="mt-8">
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
