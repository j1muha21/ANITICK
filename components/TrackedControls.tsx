"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  mediaId: number;
  pinned: boolean;
}

/** Pin/unpin + remove controls shown on dashboard cards. */
export default function TrackedControls({ mediaId, pinned }: Props) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function call(method: "PATCH" | "DELETE", body: Record<string, unknown>) {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/list", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-1.5">
      <button
        onClick={() => call("PATCH", { mediaId, pinned: !pinned })}
        disabled={busy}
        title={pinned ? "Unpin" : "Pin to top"}
        className={`glass flex-1 rounded-lg px-2 py-1.5 text-xs transition-all disabled:opacity-60 ${
          pinned ? "glow-accent text-accent-strong" : "text-muted hover:text-accent-strong"
        }`}
      >
        {pinned ? "★ Pinned" : "☆ Pin"}
      </button>
      <button
        onClick={() => call("DELETE", { mediaId })}
        disabled={busy}
        title="Remove from my list"
        className="glass rounded-lg px-2.5 py-1.5 text-xs text-muted transition-colors hover:text-red-400 disabled:opacity-60"
      >
        ✕
      </button>
    </div>
  );
}
