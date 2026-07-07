type Entry = {
  value: unknown;
  expires: number;
};

// Survive dev-server HMR by stashing the store on globalThis.
const globalStore = globalThis as unknown as {
  __anitickCache?: Map<string, Entry>;
  __anitickInflight?: Map<string, Promise<unknown>>;
};

const store = (globalStore.__anitickCache ??= new Map<string, Entry>());
const inflight = (globalStore.__anitickInflight ??= new Map<string, Promise<unknown>>());

// After an upstream failure, serve the stale value and back off this long
// before trying the producer again.
const STALE_RETRY_MS = 60 * 1000;

/**
 * Memoize an async producer under `key` for `ttlMs`. Concurrent callers for
 * the same key share one in-flight promise, so a burst of page renders costs
 * a single AniList request. Expired entries are kept and served as stale
 * fallbacks when the producer fails (e.g. AniList rate limiting).
 */
export async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) {
    return hit.value as T;
  }

  const pending = inflight.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  const promise = fn()
    .then((value) => {
      store.set(key, { value, expires: Date.now() + ttlMs });
      return value;
    })
    .catch((err) => {
      if (hit) {
        // Stale beats a crashed page; also back off further retries briefly.
        store.set(key, { value: hit.value, expires: Date.now() + STALE_RETRY_MS });
        return hit.value as T;
      }
      throw err;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}
