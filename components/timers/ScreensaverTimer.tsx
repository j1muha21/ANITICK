"use client";

import { useState } from "react";
import DigitalTimer from "./DigitalTimer";
import RingTimer from "./RingTimer";
import GlassCardTimer from "./GlassCardTimer";
import FlipTimer from "./FlipTimer";

export type TimerStyle = "digital" | "ring" | "glass" | "flip";

export const TIMER_STYLES: { id: TimerStyle; label: string }[] = [
  { id: "digital", label: "Digital" },
  { id: "ring", label: "Ring" },
  { id: "glass", label: "Glass" },
  { id: "flip", label: "Flip" },
];

interface Props {
  airingAt: number;
  defaultStyle?: TimerStyle;
  /** Persist style changes as the user's global default (logged in only). */
  persist?: boolean;
}

export default function ScreensaverTimer({ airingAt, defaultStyle = "digital", persist = false }: Props) {
  const [style, setStyle] = useState<TimerStyle>(defaultStyle);

  function pick(next: TimerStyle) {
    setStyle(next);
    if (persist) {
      // Fire-and-forget: the page doesn't depend on the response.
      fetch("/api/prefs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timerStyle: next }),
      }).catch(() => {});
    }
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="w-full">
        {style === "digital" && <DigitalTimer airingAt={airingAt} />}
        {style === "ring" && <RingTimer airingAt={airingAt} />}
        {style === "glass" && <GlassCardTimer airingAt={airingAt} />}
        {style === "flip" && <FlipTimer airingAt={airingAt} />}
      </div>

      <div className="glass flex overflow-hidden rounded-full text-xs">
        {TIMER_STYLES.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => pick(id)}
            className={`px-4 py-1.5 transition-all ${
              style === id
                ? "glow-accent bg-accent font-semibold text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
