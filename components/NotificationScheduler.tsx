"use client";

import { useEffect } from "react";

export interface UpcomingAiring {
  mediaId: number;
  title: string;
  episode: number;
  airingAt: number; // Unix seconds
}

interface Props {
  airings: UpcomingAiring[];
  leadMin: number;
}

const NOTIFIED_KEY = "anitick_notified";
// Only schedule timers for episodes whose notify-time falls within this window;
// anything later is picked up on a future page load.
const WINDOW_MS = 6 * 60 * 60 * 1000;

function loadNotified(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

function saveNotified(set: Set<string>) {
  // Keep the ledger small — old keys are useless once episodes have aired.
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...set].slice(-200)));
}

/**
 * Fires browser notifications N minutes before tracked episodes air.
 * Limitation (documented): timers only run while the app is open in a tab.
 */
export default function NotificationScheduler({ airings, leadMin }: Props) {
  useEffect(() => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

    const notified = loadNotified();
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (const airing of airings) {
      const key = `${airing.mediaId}-${airing.episode}`;
      if (notified.has(key)) continue;

      const fireAt = airing.airingAt * 1000 - leadMin * 60 * 1000;
      const delay = fireAt - Date.now();
      if (delay < -60_000 || delay > WINDOW_MS) continue;

      timers.push(
        setTimeout(() => {
          new Notification(`${airing.title}`, {
            body: `Episode ${airing.episode} airs in ${leadMin} minutes`,
            icon: "/icon.svg",
            tag: key,
          });
          notified.add(key);
          saveNotified(notified);
        }, Math.max(0, delay)),
      );
    }

    return () => timers.forEach(clearTimeout);
  }, [airings, leadMin]);

  return null;
}
