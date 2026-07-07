import Image from "next/image";
import Link from "next/link";
import type { MediaCard } from "@/lib/anilist/types";
import { displayTitle, mainStudio } from "@/lib/anilist/types";
import CountdownTimer from "@/components/CountdownTimer";
import AddToPlanningButton from "@/components/AddToPlanningButton";

interface Props {
  media: MediaCard;
  /** Show the "Add to Planning" button (only when the viewer is logged in). */
  canAddToList?: boolean;
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

export default function AnimeCard({ media, canAddToList = false }: Props) {
  const title = displayTitle(media);
  const studio = mainStudio(media);
  const cover = media.coverImage.extraLarge ?? media.coverImage.large;
  const next = media.nextAiringEpisode;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-surface transition-transform hover:-translate-y-1">
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
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/75 px-2.5 py-1.5 backdrop-blur-sm">
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
      {canAddToList && (
        <div className="px-3 pb-3">
          <AddToPlanningButton mediaId={media.id} />
        </div>
      )}
    </div>
  );
}
