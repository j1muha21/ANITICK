import { cookies } from "next/headers";
import { EncryptJWT, jwtDecrypt } from "jose";
import { createHash } from "crypto";

export const SESSION_COOKIE = "anitick_session";
export const STATE_COOKIE = "anitick_oauth_state";

export interface Session {
  accessToken: string;
  userId: number;
  userName: string;
  avatar: string | null;
}

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set — add it to .env.local");
  }
  // Normalize any secret string to the 32 bytes A256GCM requires.
  return createHash("sha256").update(secret).digest();
}

export async function sealSession(session: Session): Promise<string> {
  return new EncryptJWT({ ...session })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("330d") // AniList tokens live ~1 year; expire the cookie a bit sooner
    .encrypt(secretKey());
}

export async function openSession(sealed: string): Promise<Session | null> {
  try {
    const { payload } = await jwtDecrypt(sealed, secretKey());
    if (typeof payload.accessToken !== "string" || typeof payload.userId !== "number") {
      return null;
    }
    return {
      accessToken: payload.accessToken,
      userId: payload.userId,
      userName: String(payload.userName ?? ""),
      avatar: typeof payload.avatar === "string" ? payload.avatar : null,
    };
  } catch {
    return null;
  }
}

/** Read the current session from the request cookies (server-side only). */
export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const sealed = jar.get(SESSION_COOKIE)?.value;
  if (!sealed) return null;
  return openSession(sealed);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 330 * 24 * 60 * 60,
} as const;
