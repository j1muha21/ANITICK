"use client";

import { pad, useCountdown } from "./useCountdown";

/** Style 1 — big bold digital clock: DD : HH : MM : SS in glowing monospace. */
export default function DigitalTimer({ airingAt }: { airingAt: number }) {
  const { secondsLeft, days, hours, minutes, seconds, aired } = useCountdown(airingAt);

  if (aired) {
    return (
      <p className="text-glow text-center font-mono text-4xl font-bold text-accent sm:text-6xl md:text-7xl">
        AIRED
      </p>
    );
  }

  const segments = [
    { value: pad(days), label: "days" },
    { value: pad(hours), label: "hours" },
    { value: pad(minutes), label: "minutes" },
    { value: pad(seconds), label: "seconds" },
  ];

  return (
    <div className="flex items-start justify-center gap-1.5 sm:gap-4">
      {segments.map(({ value, label }, i) => (
        <div key={label} className="flex items-start gap-1.5 sm:gap-4">
          {i > 0 && (
            <span className="text-glow pt-1 font-mono text-3xl font-bold text-accent sm:text-5xl md:text-6xl">
              :
            </span>
          )}
          <div className="flex flex-col items-center">
            <span className="text-glow font-mono text-4xl font-bold tabular-nums text-accent-strong sm:text-6xl md:text-7xl">
              {secondsLeft === null ? "--" : value}
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-widest text-muted sm:text-xs">
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
