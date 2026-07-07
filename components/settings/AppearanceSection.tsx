"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TIMER_STYLES, type TimerStyle } from "@/components/timers/ScreensaverTimer";

const PRESETS = [
  "#a64bff", // neon purple (default)
  "#7c3aed", // violet
  "#3db4f2", // anilist blue
  "#22d3ee", // cyan
  "#34d399", // mint
  "#22c55e", // green
  "#f97316", // orange
  "#ef4444", // red
  "#ec4899", // pink
  "#eab308", // yellow
];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

interface Props {
  accentColor: string;
  timerStyle: TimerStyle;
  defaultView: "grid" | "list";
}

export default function AppearanceSection({ accentColor, timerStyle, defaultView }: Props) {
  const [accent, setAccent] = useState(accentColor);
  const [hexInput, setHexInput] = useState(accentColor);
  const [style, setStyle] = useState<TimerStyle>(timerStyle);
  const [view, setView] = useState(defaultView);
  const router = useRouter();

  async function save(patch: Record<string, unknown>) {
    await fetch("/api/prefs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    router.refresh();
  }

  function applyAccent(color: string) {
    if (!HEX_RE.test(color)) return;
    setAccent(color);
    setHexInput(color);
    // Instant repaint, then persist.
    document.documentElement.style.setProperty("--accent", color);
    void save({ accentColor: color });
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <p className="mb-3 text-xs uppercase tracking-wide text-muted">Color accent picker</p>
        <div className="flex flex-wrap items-center gap-2.5">
          {PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => applyAccent(color)}
              title={color}
              aria-label={`Accent ${color}`}
              className={`h-9 w-9 rounded-xl transition-transform hover:scale-110 ${
                accent.toLowerCase() === color ? "ring-2 ring-white/80 ring-offset-2 ring-offset-black/50" : ""
              }`}
              style={{ background: color, boxShadow: `0 0 14px ${color}66` }}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
            onBlur={() => applyAccent(hexInput)}
            onKeyDown={(e) => e.key === "Enter" && applyAccent(hexInput)}
            className="w-32 px-3 py-2 font-mono text-sm"
            placeholder="#a64bff"
            aria-label="Accent color hex"
          />
          <span className="text-xs text-muted">Accent color (hex)</span>
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs uppercase tracking-wide text-muted">Default countdown style</p>
        <div className="glass flex w-fit overflow-hidden rounded-lg text-sm">
          {TIMER_STYLES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => {
                setStyle(id);
                void save({ timerStyle: id });
              }}
              className={`px-4 py-2 transition-all ${
                style === id ? "glow-accent bg-accent font-semibold text-white" : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">Used on every anime timer page by default.</p>
      </div>

      <div>
        <p className="mb-3 text-xs uppercase tracking-wide text-muted">Default browsing view</p>
        <div className="glass flex w-fit overflow-hidden rounded-lg text-sm">
          {(["grid", "list"] as const).map((v) => (
            <button
              key={v}
              onClick={() => {
                setView(v);
                void save({ defaultView: v });
              }}
              className={`px-4 py-2 capitalize transition-all ${
                view === v ? "glow-accent bg-accent font-semibold text-white" : "text-muted hover:text-foreground"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
