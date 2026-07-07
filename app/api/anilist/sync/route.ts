import { NextResponse } from "next/server";
import { AniListError, fetchAniListAuthed } from "@/lib/anilist/client";
import { getConnection } from "@/lib/anilist/connection";
import { SYNC_LIST_QUERY } from "@/lib/anilist/queries";
import { addTracked, type TrackedStatus } from "@/lib/list";
import { getUser } from "@/lib/session";

interface SyncEntry {
  status: string | null;
  media: {
    id: number;
    title: { romaji: string | null; english: string | null };
    coverImage: { large: string | null };
  } | null;
}

interface SyncData {
  MediaListCollection: {
    lists: { status: string | null; entries: SyncEntry[] }[];
  };
}

function mapStatus(anilistStatus: string | null): TrackedStatus {
  switch (anilistStatus) {
    case "CURRENT":
    case "REPEATING":
      return "watching";
    case "PLANNING":
      return "planning";
    case "COMPLETED":
      return "completed";
    default:
      return "other";
  }
}

export async function POST() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const connection = await getConnection(user.id);
  if (!connection) {
    return NextResponse.json({ error: "AniList is not connected" }, { status: 400 });
  }

  let data: SyncData;
  try {
    data = await fetchAniListAuthed<SyncData>(connection.accessToken, SYNC_LIST_QUERY, {
      userId: connection.anilistUserId,
    });
  } catch (err) {
    const status = err instanceof AniListError ? err.status : 500;
    return NextResponse.json(
      { error: "AniList request failed — try reconnecting your account" },
      { status: status === 401 ? 401 : 502 },
    );
  }

  let imported = 0;
  for (const list of data.MediaListCollection.lists) {
    for (const entry of list.entries) {
      if (!entry.media) continue;
      await addTracked(user.id, {
        mediaId: entry.media.id,
        title: entry.media.title.english ?? entry.media.title.romaji ?? "Untitled",
        coverImage: entry.media.coverImage.large,
        status: mapStatus(entry.status ?? list.status),
        source: "anilist",
      });
      imported++;
    }
  }

  return NextResponse.json({ ok: true, imported });
}
