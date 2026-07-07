"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import CountdownTimer from "@/components/CountdownTimer";

export interface CalendarItem {
  mediaId: number;
  title: string;
  cover: string | null;
  episode: number;
  airingAt: number; // Unix seconds
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** Mon=0 … Sun=6 in the *viewer's* timezone — so grouping happens client-side. */
function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export default function CalendarWeek({ items }: { items: CalendarItem[] }) {
  // Render after mount so day buckets use the viewer's timezone, not the server's.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="glass h-64 animate-pulse rounded-2xl" />;
  }

  const today = weekdayIndex(new Date());
  const byDay: CalendarItem[][] = DAYS.map(() => []);
  for (const item of items) {
    byDay[weekdayIndex(new Date(item.airingAt * 1000))].push(item);
  }
  byDay.forEach((list) => list.sort((a, b) => a.airingAt - b.airingAt));

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
      {DAYS.map((day, i) => (
        <div
          key={day}
          className={`glass rounded-2xl p-3 ${i === today ? "glow-accent border-accent/40" : ""}`}
        >
          <p
            className={`mb-3 text-xs font-bold uppercase tracking-wide ${
              i === today ? "text-accent-strong" : "text-muted"
            }`}
          >
            {day}
            {i === today && " · today"}
          </p>
          <div className="flex flex-col gap-2">
            {byDay[i].length === 0 ? (
              <p className="text-xs text-muted/60">—</p>
            ) : (
              byDay[i].map((item) => (
                <Link
                  key={`${item.mediaId}-${item.episode}`}
                  href={`/anime/${item.mediaId}`}
                  className="glass-raised flex items-center gap-2.5 rounded-xl p-2 transition-shadow hover:glow-accent"
                >
                  {item.cover && (
                    <Image
                      src={item.cover}
                      alt=""
                      width={32}
                      height={44}
                      className="h-11 w-8 rounded-md object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-xs font-semibold">{item.title}</p>
                    <p className="text-[11px] text-muted">
                      Ep {item.episode} ·{" "}
                      {new Date(item.airingAt * 1000).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <CountdownTimer airingAt={item.airingAt} className="!text-[11px]" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
