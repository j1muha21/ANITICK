import Image from "next/image";
import Link from "next/link";
import type { MediaCard } from "@/lib/anilist/types";
import { displayTitle, mainStudio } from "@/lib/anilist/types";
import { formatLabel } from "@/components/AnimeCard";
import CountdownTimer from "@/components/CountdownTimer";
import AddToPlanningButton from "@/components/AddToPlanningButton";

interface Props {
  media: MediaCard;
  canAddToList?: boolean;
}

export default function AnimeListRow({ media, canAddToList = false }: Props) {
  const title = displayTitle(media);
  const studio = mainStudio(media);
  const next = media.nextAiringEpisode;

  return (
    <div className="flex items-center gap-4 rounded-xl bg-surface p-3">
      <Link href={`/anime/${media.id}`} className="shrink-0">
        {media.coverImage.large && (
          <Image
            src={media.coverImage.large}
            alt={title}
            width={56}
            height={80}
            className="h-20 w-14 rounded-lg object-cover"
          />
        )}
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          href={`/anime/${media.id}`}
          className="line-clamp-1 text-sm font-semibold hover:text-accent-strong"
        >
          {title}
        </Link>
        <p className="mt-0.5 text-xs text-muted">
          {[formatLabel(media.format), media.episodes ? `${media.episodes} eps` : null, studio]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <p className="mt-0.5 hidden text-xs text-muted sm:block">
          {media.genres.slice(0, 4).join(", ")}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        {media.averageScore && (
          <span className="text-xs font-semibold text-muted">{media.averageScore}%</span>
        )}
        {next && (
          <div className="text-right">
            <span className="mr-2 text-xs text-muted">Ep {next.episode}</span>
            <CountdownTimer airingAt={next.airingAt} />
          </div>
        )}
        {canAddToList && (
          <div className="w-36">
            <AddToPlanningButton mediaId={media.id} />
          </div>
        )}
      </div>
    </div>
  );
}
