"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  /** Unix timestamp in seconds (AniList `airingAt`). */
  airingAt: number;
  /** Compact renders a single-line badge; full renders labeled segments. */
  variant?: "compact" | "full";
  className?: string;
}

function parts(secondsLeft: number) {
  const d = Math.floor(secondsLeft / 86400);
  const h = Math.floor((secondsLeft % 86400) / 3600);
  const m = Math.floor((secondsLeft % 3600) / 60);
  const s = Math.floor(secondsLeft % 60);
  return { d, h, m, s };
}

export default function CountdownTimer({ airingAt, variant = "compact", className = "" }: Props) {
  // null until mounted so the server and first client render agree.
  const [now, setNow] = useState<number | null>(null);
  const refreshed = useRef(false);
  const router = useRouter();

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const secondsLeft = now === null ? null : Math.floor(airingAt - now / 1000);

  useEffect(() => {
    // Once the episode airs, pull fresh schedule data for the page.
    if (secondsLeft !== null && secondsLeft <= 0 && !refreshed.current) {
      refreshed.current = true;
      const id = setTimeout(() => router.refresh(), 5000);
      return () => clearTimeout(id);
    }
  }, [secondsLeft, router]);

  if (secondsLeft === null) {
    return <span className={`font-mono text-sm text-muted ${className}`}>--:--:--:--</span>;
  }

  if (secondsLeft <= 0) {
    return <span className={`text-sm font-semibold text-accent ${className}`}>Aired</span>;
  }

  const { d, h, m, s } = parts(secondsLeft);
  const pad = (n: number) => String(n).padStart(2, "0");

  if (variant === "full") {
    const segments = [
      { value: d, label: "days" },
      { value: h, label: "hours" },
      { value: m, label: "min" },
      { value: s, label: "sec" },
    ];
    return (
      <div className={`flex gap-3 ${className}`}>
        {segments.map(({ value, label }) => (
          <div
            key={label}
            className="glass-raised glow-accent flex min-w-16 flex-col items-center rounded-xl px-3 py-2"
          >
            <span className="font-mono text-2xl font-bold text-accent-strong">{pad(value)}</span>
            <span className="text-xs uppercase tracking-wide text-muted">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <span className={`font-mono text-sm font-semibold text-accent-strong ${className}`}>
      {d > 0 ? `${d}d ` : ""}
      {pad(h)}:{pad(m)}:{pad(s)}
    </span>
  );
}
