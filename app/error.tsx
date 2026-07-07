"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto mt-16 max-w-md">
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-glow text-4xl">⏳</p>
        <h1 className="mt-4 text-lg font-bold">Couldn&apos;t load this page</h1>
        <p className="mt-2 text-sm text-muted">
          AniList may be rate-limiting us for a moment — it usually clears within a minute.
        </p>
        <button
          onClick={reset}
          className="glow-accent mt-6 rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
        >
          Try again
        </button>
        {error.digest && <p className="mt-4 text-[10px] text-muted/60">ref: {error.digest}</p>}
      </div>
    </div>
  );
}
