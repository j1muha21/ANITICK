import Image from "next/image";
import Link from "next/link";
import type { MediaCard } from "@/lib/anilist/types";
import { displayTitle, mainStudio } from "@/lib/anilist/types";
import CountdownTimer from "@/components/CountdownTimer";
import AddToListButton from "@/components/AddToListButton";
import TrackedControls from "@/components/TrackedControls";

interface Props {
  media: MediaCard;
  /** Show the add/remove list button (only when the viewer is logged in). */
  canAddToList?: boolean;
  /** Whether this anime is already on the viewer's list. */
  tracked?: boolean;
  /** Dashboard mode: show pin/remove controls instead of the add button. */
  controls?: { pinned: boolean };
}

const FORMAT_LABELS: Record<string, string> = {
  TV: "TV",
  TV_SHORT: "TV Short",
  MOVIE: "Movie",
  SPECIAL: "Special",
  OVA: "OVA",
  ONA: "ONA",
  MUSIC: "Music",
};

export function formatLabel(format: string | null): string {
  if (!format) return "";
  return FORMAT_LABELS[format] ?? format.replaceAll("_", " ");
}

export function suggestedStatus(media: Pick<MediaCard, "status">): "watching" | "planning" {
  return media.status === "RELEASING" ? "watching" : "planning";
}

export default function AnimeCard({ media, canAddToList = false, tracked = false, controls }: Props) {
  const title = displayTitle(media);
  const studio = mainStudio(media);
  const cover = media.coverImage.extraLarge ?? media.coverImage.large;
  const next = media.nextAiringEpisode;

  return (
    <div className="glass group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:glow-accent">
      <Link href={`/anime/${media.id}`} className="flex flex-1 flex-col">
        <div className="relative aspect-2/3 w-full bg-surface-raised">
          {cover && (
            <Image
              src={cover}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
              className="object-cover"
            />
          )}
          {next && (
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-glass-border bg-black/60 px-2.5 py-1.5 backdrop-blur-md">
              <span className="text-xs text-muted">Ep {next.episode}</span>
              <CountdownTimer airingAt={next.airingAt} />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-accent-strong">
            {title}
          </h3>
          <p className="text-xs text-muted">
            {[formatLabel(media.format), media.episodes ? `${media.episodes} eps` : null, studio]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </Link>
      {controls ? (
        <div className="px-3 pb-3">
          <TrackedControls mediaId={media.id} pinned={controls.pinned} />
        </div>
      ) : canAddToList ? (
        <div className="px-3 pb-3">
          <AddToListButton
            mediaId={media.id}
            title={title}
            coverImage={media.coverImage.large}
            status={suggestedStatus(media)}
            tracked={tracked}
          />
        </div>
      ) : null}
    </div>
  );
}
