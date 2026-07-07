import { NextRequest, NextResponse } from "next/server";
import { fetchAniListAuthed } from "@/lib/anilist/client";
import { saveConnection } from "@/lib/anilist/connection";
import { VIEWER_QUERY } from "@/lib/anilist/queries";
import type { Viewer } from "@/lib/anilist/types";
import { STATE_COOKIE, getUser } from "@/lib/session";

function failure(origin: string, reason: string) {
  console.error(`AniList connect failed: ${reason}`);
  return NextResponse.redirect(`${origin}/settings?anilist=error`);
}

export async function GET(req: NextRequest) {
  const { origin, searchParams } = req.nextUrl;

  const user = await getUser();
  if (!user) return NextResponse.redirect(`${origin}/login`);

  const code = searchParams.get("code");
  if (!code) return failure(origin, "no code in callback");

  const state = searchParams.get("state");
  const expectedState = req.cookies.get(STATE_COOKIE)?.value;
  if (!expectedState || state !== expectedState) {
    return failure(origin, "state mismatch");
  }

  // Exchange the authorization code for an access token (server-side only —
  // this is the sole place the client secret is used).
  const tokenRes = await fetch("https://anilist.co/api/v2/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: process.env.ANILIST_CLIENT_ID,
      client_secret: process.env.ANILIST_CLIENT_SECRET,
      redirect_uri: process.env.ANILIST_REDIRECT_URI,
      code,
    }),
  });

  if (!tokenRes.ok) {
    return failure(origin, `token exchange returned ${tokenRes.status}`);
  }

  const { access_token: accessToken } = (await tokenRes.json()) as { access_token?: string };
  if (!accessToken) return failure(origin, "no access_token in token response");

  let viewer: Viewer;
  try {
    ({ Viewer: viewer } = await fetchAniListAuthed<{ Viewer: Viewer }>(accessToken, VIEWER_QUERY));
  } catch {
    return failure(origin, "could not fetch Viewer with new token");
  }

  await saveConnection(user.id, {
    accessToken,
    anilistUserId: viewer.id,
    anilistUserName: viewer.name,
    avatar: viewer.avatar?.medium ?? null,
  });

  const res = NextResponse.redirect(`${origin}/settings?anilist=connected`);
  res.cookies.delete(STATE_COOKIE);
  return res;
}
