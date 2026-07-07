"use client";

import { pad, useCountdown } from "./useCountdown";

const WEEK = 7 * 24 * 3600; // typical inter-episode interval

/** Style 2 — circular progress ring depleting toward the next episode. */
export default function RingTimer({ airingAt }: { airingAt: number }) {
  const { secondsLeft, days, hours, minutes, seconds, aired } = useCountdown(airingAt);

  const size = 260;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  // Fraction of the (assumed weekly) wait already elapsed.
  const remaining = Math.min(Math.max(secondsLeft ?? WEEK, 0), WEEK);
  const progress = aired ? 1 : 1 - remaining / WEEK;

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        style={{ filter: "drop-shadow(0 0 14px color-mix(in srgb, var(--accent) 60%, transparent))" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--glass-border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {aired ? (
          <span className="text-glow text-3xl font-bold text-accent">AIRED</span>
        ) : (
          <>
            <span className="font-mono text-4xl font-bold tabular-nums text-foreground">
              {secondsLeft === null
                ? "--:--"
                : days > 0
                  ? `${days}d ${pad(hours)}h`
                  : `${pad(hours)}:${pad(minutes)}`}
            </span>
            <span className="mt-1 font-mono text-lg tabular-nums text-muted">
              {secondsLeft === null ? "" : days > 0 ? `${pad(minutes)}m ${pad(seconds)}s` : `${pad(seconds)}s`}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
