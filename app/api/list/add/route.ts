import { NextRequest, NextResponse } from "next/server";
import { AniListError, fetchAniListAuthed } from "@/lib/anilist/client";
import { ADD_TO_PLANNING_MUTATION } from "@/lib/anilist/queries";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const mediaId = body?.mediaId;
  if (!Number.isInteger(mediaId) || mediaId <= 0) {
    return NextResponse.json({ error: "Invalid mediaId" }, { status: 400 });
  }

  try {
    const data = await fetchAniListAuthed<{ SaveMediaListEntry: { id: number; status: string } }>(
      session.accessToken,
      ADD_TO_PLANNING_MUTATION,
      { mediaId },
    );
    return NextResponse.json(data.SaveMediaListEntry);
  } catch (err) {
    const status = err instanceof AniListError ? err.status : 500;
    const message = err instanceof Error ? err.message : "AniList request failed";
    return NextResponse.json({ error: message }, { status: status >= 400 ? status : 500 });
  }
}
