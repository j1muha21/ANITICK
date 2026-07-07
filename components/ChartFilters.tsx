"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CHART_SORTS, FORMATS, GENRES } from "@/lib/season";

export default function ChartFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}${params.size ? `?${params}` : ""}`);
  }

  const view = searchParams.get("view") === "list" ? "list" : "grid";

  const selectClass = "rounded-lg bg-surface px-3 py-2 text-sm";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="Format"
        value={searchParams.get("format") ?? ""}
        onChange={(e) => setParam("format", e.target.value)}
        className={selectClass}
      >
        <option value="">All formats</option>
        {FORMATS.map((f) => (
          <option key={f} value={f}>
            {f === "TV_SHORT" ? "TV Short" : f.replace("_", " ")}
          </option>
        ))}
      </select>

      <select
        aria-label="Genre"
        value={searchParams.get("genre") ?? ""}
        onChange={(e) => setParam("genre", e.target.value)}
        className={selectClass}
      >
        <option value="">All genres</option>
        {GENRES.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      <select
        aria-label="Sort"
        value={searchParams.get("sort") ?? "POPULARITY_DESC"}
        onChange={(e) => setParam("sort", e.target.value)}
        className={selectClass}
      >
        {Object.entries(CHART_SORTS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <div className="ml-auto flex overflow-hidden rounded-lg bg-surface text-sm">
        {(["grid", "list"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setParam("view", v === "grid" ? "" : v)}
            className={`px-3 py-2 capitalize transition-colors ${
              view === v ? "bg-accent font-semibold text-background" : "hover:bg-surface-raised"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
