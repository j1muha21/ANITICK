"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CountdownTimer from "@/components/CountdownTimer";
import type { ScheduleEpisode } from "@/lib/anilist/calendar";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Local-timezone day key, e.g. "2026-7-8". */
function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export default function MonthCalendar({ episodes }: { episodes: ScheduleEpisode[] }) {
  // Render after mount so day buckets use the viewer's timezone, not the server's.
  const [mounted, setMounted] = useState(false);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  const byDay = useMemo(() => {
    const map = new Map<string, ScheduleEpisode[]>();
    for (const ep of episodes) {
      const key = dayKey(new Date(ep.airingAt * 1000));
      const list = map.get(key) ?? [];
      list.push(ep);
      map.set(key, list);
    }
    map.forEach((list) => list.sort((a, b) => a.airingAt - b.airingAt));
    return map;
  }, [episodes]);

  if (!mounted) {
    return <div className="glass h-96 animate-pulse rounded-2xl" />;
  }

  const todayKey = dayKey(new Date());
  const year = month.getFullYear();
  const monthIdx = month.getMonth();
  // Monday-first offset of the 1st, then 42 cells (6 weeks) covering the month.
  const startOffset = (new Date(year, monthIdx, 1).getDay() + 6) % 7;
  const cells = Array.from({ length: 42 }, (_, i) => new Date(year, monthIdx, i + 1 - startOffset));

  const selectedEpisodes = selected ? (byDay.get(selected) ?? []) : [];
  const selectedDate = selected
    ? new Date(...(selected.split("-").map(Number) as [number, number, number]))
    : null;

  function shiftMonth(delta: number) {
    setMonth(new Date(year, monthIdx + delta, 1));
    setSelected(null);
  }

  return (
    <div>
      {/* Month header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => shiftMonth(-1)}
          aria-label="Previous month"
          className="glass rounded-lg px-3 py-2 text-sm transition-shadow hover:glow-accent"
        >
          ←
        </button>
        <h2 className="text-lg font-bold">
          {MONTHS[monthIdx]} <span className="text-muted">{year}</span>
        </h2>
        <button
          onClick={() => shiftMonth(1)}
          aria-label="Next month"
          className="glass rounded-lg px-3 py-2 text-sm transition-shadow hover:glow-accent"
        >
          →
        </button>
      </div>

      {/* Weekday header */}
      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-wide text-muted sm:gap-2 sm:text-xs">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {cells.map((date) => {
          const key = dayKey(date);
          const inMonth = date.getMonth() === monthIdx;
          const eps = byDay.get(key) ?? [];
          const isToday = key === todayKey;
          const isSelected = key === selected;

          return (
            <button
              key={key}
              onClick={() => setSelected(isSelected ? null : key)}
              aria-label={`${date.toDateString()}, ${eps.length} episode${eps.length === 1 ? "" : "s"}`}
              className={`glass flex min-h-16 flex-col items-stretch rounded-lg p-1 text-left transition-all sm:min-h-24 sm:rounded-xl sm:p-1.5 ${
                inMonth ? "" : "opacity-35"
              } ${isSelected ? "glow-accent border-accent/60" : "hover:glow-accent"} ${
                isToday ? "border-accent/40" : ""
              }`}
            >
              <span
                className={`mb-1 text-[11px] font-semibold sm:text-xs ${
                  isToday ? "text-accent-strong" : "text-muted"
                }`}
              >
                {date.getDate()}
              </span>

              {/* Mobile: dots. Desktop: tiny covers. */}
              {eps.length > 0 && (
                <>
                  <div className="flex flex-wrap gap-0.5 sm:hidden">
                    {eps.slice(0, 4).map((ep, i) => (
                      <span key={i} className="h-1.5 w-1.5 rounded-full bg-accent" />
                    ))}
                    {eps.length > 4 && <span className="text-[9px] text-muted">+{eps.length - 4}</span>}
                  </div>
                  <div className="hidden flex-wrap gap-1 sm:flex">
                    {eps.slice(0, 3).map((ep, i) =>
                      ep.cover ? (
                        <Image
                          key={`${ep.mediaId}-${ep.episode}-${i}`}
                          src={ep.cover}
                          alt={ep.title}
                          width={20}
                          height={28}
                          className="h-7 w-5 rounded-sm object-cover"
                        />
                      ) : (
                        <span key={i} className="h-7 w-5 rounded-sm bg-accent-soft" />
                      ),
                    )}
                    {eps.length > 3 && (
                      <span className="self-end text-[10px] text-muted">+{eps.length - 3}</span>
                    )}
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Expanded day panel */}
      {selected && selectedDate && (
        <div className="glass glow-accent mt-4 rounded-2xl p-4 sm:p-5">
          <p className="mb-3 text-sm font-bold">
            {selectedDate.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
            {selected === todayKey && <span className="ml-2 text-accent-strong">· today</span>}
          </p>
          {selectedEpisodes.length === 0 ? (
            <p className="text-sm text-muted">Nothing airs this day.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {selectedEpisodes.map((ep) => (
                <li key={`${ep.mediaId}-${ep.episode}`}>
                  <Link
                    href={`/anime/${ep.mediaId}`}
                    className="glass-raised flex items-center gap-3 rounded-xl p-2.5 transition-shadow hover:glow-accent"
                  >
                    {ep.cover && (
                      <Image
                        src={ep.cover}
                        alt=""
                        width={40}
                        height={56}
                        className="h-14 w-10 rounded-md object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold">{ep.title}</p>
                      <p className="text-xs text-muted">
                        Episode {ep.episode} ·{" "}
                        {new Date(ep.airingAt * 1000).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {ep.airingAt * 1000 > Date.now() ? (
                      <CountdownTimer airingAt={ep.airingAt} />
                    ) : (
                      <span className="text-xs font-semibold text-accent">Aired</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
