import { cached } from "@/lib/cache";

const ANILIST_API = "https://graphql.anilist.co";

export class AniListError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "AniListError";
  }
}

async function gql<T>(
  query: string,
  variables: Record<string, unknown>,
  token?: string,
): Promise<T> {
  const res = await fetch(ANILIST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || json?.errors?.length) {
    const message =
      json?.errors?.[0]?.message ?? `AniList request failed with status ${res.status}`;
    throw new AniListError(message, res.status);
  }

  return json.data as T;
}

const DEFAULT_TTL = 15 * 60 * 1000; // 15 minutes

/**
 * Public (unauthenticated) query, memoized in-process so repeated renders
 * stay far under AniList's rate limit (~90 req/min, often degraded to ~30).
 */
export async function fetchAniList<T>(
  query: string,
  variables: Record<string, unknown> = {},
  ttlMs: number = DEFAULT_TTL,
): Promise<T> {
  const key = JSON.stringify([query, variables]);
  return cached(key, ttlMs, () => gql<T>(query, variables));
}

/** Authenticated query/mutation on behalf of a user. Never cached. */
export async function fetchAniListAuthed<T>(
  token: string,
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  return gql<T>(query, variables, token);
}
