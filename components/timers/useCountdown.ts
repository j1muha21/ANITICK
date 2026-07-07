"use client";

import { useEffect, useState } from "react";

export interface CountdownParts {
  /** null until mounted (avoids SSR/client hydration mismatch) */
  secondsLeft: number | null;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  aired: boolean;
}

export function useCountdown(airingAt: number): CountdownParts {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const secondsLeft = now === null ? null : Math.floor(airingAt - now / 1000);
  const s = Math.max(0, secondsLeft ?? 0);

  return {
    secondsLeft,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: Math.floor(s % 60),
    aired: secondsLeft !== null && secondsLeft <= 0,
  };
}

export const pad = (n: number) => String(n).padStart(2, "0");
