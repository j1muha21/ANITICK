"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  mediaId: number;
  title: string;
  coverImage?: string | null;
  /** Suggested status for new entries (e.g. planning for unaired shows). */
  status?: "watching" | "planning";
  /** Whether this anime is already on the viewer's list. */
  tracked: boolean;
}

type State = "idle" | "busy" | "error";

export default function AddToListButton({ mediaId, title, coverImage, status, tracked }: Props) {
  const [state, setState] = useState<State>("idle");
  const [isTracked, setIsTracked] = useState(tracked);
  const router = useRouter();

  async function toggle() {
    if (state === "busy") return;
    setState("busy");
    try {
      const res = await fetch("/api/list", {
        method: isTracked ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isTracked ? { mediaId } : { mediaId, title, coverImage, status },
        ),
      });
      if (!res.ok) throw new Error();
      setIsTracked(!isTracked);
      setState("idle");
      router.refresh();
    } catch {
      setState("error");
    }
  }

  const label =
    state === "busy"
      ? "…"
      : state === "error"
        ? "Failed — retry"
        : isTracked
          ? "✓ On My List"
          : "+ Add to My List";

  return (
    <button
      onClick={toggle}
      disabled={state === "busy"}
      title={isTracked ? "Remove from my list" : "Add to my list"}
      className={`w-full rounded-lg px-2 py-1.5 text-xs font-medium transition-all disabled:opacity-70 ${
        isTracked
          ? "glow-accent bg-accent-soft text-accent-strong hover:bg-surface-raised"
          : "glass-raised text-accent-strong hover:bg-accent hover:text-white hover:glow-accent"
      }`}
    >
      {label}
    </button>
  );
}
