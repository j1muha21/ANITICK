"use client";

import { pad, useCountdown } from "./useCountdown";

/** Style 1 — big bold digital clock: DD : HH : MM : SS in glowing monospace. */
export default function DigitalTimer({ airingAt }: { airingAt: number }) {
  const { secondsLeft, days, hours, minutes, seconds, aired } = useCountdown(airingAt);

  if (aired) {
    return <p className="text-glow font-mono text-5xl font-bold text-accent sm:text-7xl">AIRED</p>;
  }

  const segments = [
    { value: pad(days), label: "days" },
    { value: pad(hours), label: "hours" },
    { value: pad(minutes), label: "minutes" },
    { value: pad(seconds), label: "seconds" },
  ];

  return (
    <div className="flex items-start justify-center gap-2 sm:gap-4">
      {segments.map(({ value, label }, i) => (
        <div key={label} className="flex items-start gap-2 sm:gap-4">
          {i > 0 && (
            <span className="text-glow pt-1 font-mono text-4xl font-bold text-accent sm:text-6xl">
              :
            </span>
          )}
          <div className="flex flex-col items-center">
            <span className="text-glow font-mono text-5xl font-bold tabular-nums text-accent-strong sm:text-7xl">
              {secondsLeft === null ? "--" : value}
            </span>
            <span className="mt-1 text-xs uppercase tracking-widest text-muted">{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
