import { headers } from "next/headers";
import { EncryptJWT, jwtDecrypt } from "jose";
import { createHash } from "crypto";
import { auth } from "@/lib/auth";

export const STATE_COOKIE = "anitick_oauth_state";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

/** The logged-in app user (better-auth session), or null. Server-side only. */
export async function getUser(): Promise<AppUser | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user ?? null;
  } catch (err) {
    // Next.js control-flow errors (dynamic-usage, redirects) must propagate,
    // or pages silently prerender as logged-out.
    if (err && typeof err === "object" && "digest" in err) throw err;
    // Degrade to logged-out rather than crash, but keep the cause visible —
    // a silent null here once masked pooler exhaustion as "random logouts".
    console.error("getUser: session lookup failed:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Token sealing — encrypts AniList access tokens before they touch the DB
// ---------------------------------------------------------------------------

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set — add it to .env.local");
  }
  // Normalize any secret string to the 32 bytes A256GCM requires.
  return createHash("sha256").update(secret).digest();
}

export async function sealToken(token: string): Promise<string> {
  return new EncryptJWT({ t: token })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .encrypt(secretKey());
}

export async function openToken(sealed: string): Promise<string | null> {
  try {
    const { payload } = await jwtDecrypt(sealed, secretKey());
    return typeof payload.t === "string" ? payload.t : null;
  } catch {
    return null;
  }
}
