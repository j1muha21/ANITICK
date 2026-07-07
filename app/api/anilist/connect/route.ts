import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { STATE_COOKIE, getUser } from "@/lib/session";

export async function GET(req: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const clientId = process.env.ANILIST_CLIENT_ID;
  const redirectUri = process.env.ANILIST_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "ANILIST_CLIENT_ID / ANILIST_REDIRECT_URI are not configured" },
      { status: 500 },
    );
  }

  const state = randomBytes(16).toString("hex");

  const authorizeUrl = new URL("https://anilist.co/api/v2/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("state", state);

  const res = NextResponse.redirect(authorizeUrl);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });
  return res;
}
