import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import MonthCalendar from "@/components/MonthCalendar";
import { fetchAiringCalendar } from "@/lib/anilist/calendar";
import { getTrackedIds } from "@/lib/list";
import { getUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Calendar" };

export default async function CalendarPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const ids = await getTrackedIds(user.id);
  const episodes = await fetchAiringCalendar(ids);

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-1 text-2xl font-bold">Calendar</h1>
      <p className="mb-6 text-sm text-muted">
        Every upcoming episode of your tracked anime for the next 8 weeks, in your local time.
        Tap a day to see what airs.
      </p>

      {episodes.length === 0 ? (
        <p className="glass rounded-2xl p-8 text-center text-sm text-muted">
          No upcoming episodes on your tracked list.{" "}
          <Link href="/chart" className="text-accent-strong hover:underline">
            Add some airing anime from the seasonal chart
          </Link>
          .
        </p>
      ) : (
        <MonthCalendar episodes={episodes} />
      )}
    </div>
  );
}
