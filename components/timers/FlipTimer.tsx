"use client";

import { pad, useCountdown } from "./useCountdown";

function FlipDigit({ char }: { char: string }) {
  return (
    <span
      // Keying by the character remounts the element on change, replaying the
      // flip animation like a split-flap panel.
      key={char}
      className="flip-digit relative inline-flex h-11 w-7 items-center justify-center rounded-lg bg-[#12121a] font-mono text-2xl font-bold text-accent-strong shadow-[inset_0_-1px_0_rgba(255,255,255,0.08)] sm:h-16 sm:w-11 sm:text-4xl md:h-20 md:w-14 md:text-5xl"
    >
      {char}
      {/* split-flap divider line */}
      <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/70" />
    </span>
  );
}

function FlipGroup({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {value.split("").map((char, i) => (
          <FlipDigit key={`${label}-${i}-${char}`} char={char} />
        ))}
      </div>
      <span className="text-[10px] uppercase tracking-widest text-muted sm:text-xs">{label}</span>
    </div>
  );
}

/** Style 4 — retro split-flap clock with a flip animation per digit. */
export default function FlipTimer({ airingAt }: { airingAt: number }) {
  const { secondsLeft, days, hours, minutes, seconds, aired } = useCountdown(airingAt);

  if (aired) {
    return (
      <div className="flex justify-center gap-1">
        {"AIRED".split("").map((c, i) => (
          <FlipDigit key={i} char={c} />
        ))}
      </div>
    );
  }

  const groups = [
    { value: secondsLeft === null ? "--" : pad(days), label: "days" },
    { value: secondsLeft === null ? "--" : pad(hours), label: "hours" },
    { value: secondsLeft === null ? "--" : pad(minutes), label: "minutes" },
    { value: secondsLeft === null ? "--" : pad(seconds), label: "seconds" },
  ];

  return (
    <div className="flex items-start justify-center gap-1.5 sm:gap-3 md:gap-4">
      {groups.map((g, i) => (
        <div key={g.label} className="flex items-start gap-1.5 sm:gap-3 md:gap-4">
          {i > 0 && (
            <span className="pt-2 font-mono text-xl font-bold text-muted sm:pt-4 sm:text-3xl md:text-4xl">
              :
            </span>
          )}
          <FlipGroup value={g.value} label={g.label} />
        </div>
      ))}
    </div>
  );
}
