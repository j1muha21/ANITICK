"use client";

import { pad, useCountdown } from "./useCountdown";

/** Style 3 — glass-morphism card with soft-shadowed time blocks. */
export default function GlassCardTimer({ airingAt }: { airingAt: number }) {
  const { secondsLeft, days, hours, minutes, seconds, aired } = useCountdown(airingAt);

  if (aired) {
    return (
      <div className="glass glow-accent mx-auto max-w-md rounded-3xl px-10 py-8 text-center">
        <span className="text-glow text-4xl font-bold text-accent">AIRED</span>
      </div>
    );
  }

  const segments = [
    { value: days, label: "days" },
    { value: hours, label: "hours" },
    { value: minutes, label: "minutes" },
    { value: seconds, label: "seconds" },
  ];

  return (
    <div className="glass glow-accent mx-auto rounded-3xl p-4 sm:p-8">
      <div className="flex justify-center gap-2 sm:gap-5">
        {segments.map(({ value, label }) => (
          <div
            key={label}
            className="glass-raised flex min-w-14 flex-col items-center rounded-2xl px-2 py-3 shadow-lg sm:min-w-20 sm:px-5 sm:py-4"
          >
            <span className="font-mono text-2xl font-bold tabular-nums text-accent-strong sm:text-5xl">
              {secondsLeft === null ? "--" : pad(value)}
            </span>
            <span className="mt-2 text-[10px] uppercase tracking-widest text-muted sm:text-xs">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
