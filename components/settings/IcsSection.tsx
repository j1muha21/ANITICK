"use client";

import { useState } from "react";

export default function IcsSection({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window === "undefined" ? "" : `${window.location.origin}/api/ics/${token}`;

  async function copy() {
    await navigator.clipboard.writeText(url || `/api/ics/${token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">
        Subscribe to your airing schedule from Google or Apple Calendar — each tracked anime's
        next episode appears as an event. The link is private to you; anyone with it can see your
        list, so treat it like a password.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <code className="glass max-w-full overflow-x-auto whitespace-nowrap rounded-lg px-3 py-2 text-xs text-muted">
          /api/ics/{token}
        </code>
        <button
          onClick={copy}
          className="glass-raised rounded-lg px-4 py-2 text-sm font-medium text-accent-strong transition-all hover:bg-accent hover:text-white"
        >
          {copied ? "Copied!" : "Copy feed URL"}
        </button>
      </div>
    </div>
  );
}
