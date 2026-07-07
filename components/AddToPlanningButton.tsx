"use client";

import { useState } from "react";

type State = "idle" | "saving" | "added" | "error";

export default function AddToPlanningButton({ mediaId }: { mediaId: number }) {
  const [state, setState] = useState<State>("idle");

  async function add() {
    if (state === "saving" || state === "added") return;
    setState("saving");
    try {
      const res = await fetch("/api/list/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId }),
      });
      setState(res.ok ? "added" : "error");
    } catch {
      setState("error");
    }
  }

  const label =
    state === "saving"
      ? "Adding…"
      : state === "added"
        ? "✓ In Planning"
        : state === "error"
          ? "Failed — retry"
          : "+ Add to Planning";

  return (
    <button
      onClick={add}
      disabled={state === "saving" || state === "added"}
      className="glass-raised w-full rounded-lg px-2 py-1.5 text-xs font-medium text-accent-strong transition-all hover:bg-accent hover:text-white hover:glow-accent disabled:cursor-default disabled:opacity-70"
    >
      {label}
    </button>
  );
}
