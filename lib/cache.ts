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

/**
 * Memoize an async producer under `key` for `ttlMs`. Concurrent callers for
 * the same key share one in-flight promise, so a burst of page renders costs
 * a single AniList request.
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
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
  return promise;
}
