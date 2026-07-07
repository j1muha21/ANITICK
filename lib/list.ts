import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { trackedAnime } from "@/lib/db/schema";

export type TrackedStatus = "watching" | "planning" | "completed" | "other";

export interface TrackedRow {
  id: number;
  mediaId: number;
  title: string;
  coverImage: string | null;
  status: string;
  pinned: boolean;
  source: string;
}

export async function getTrackedList(userId: string): Promise<TrackedRow[]> {
  return db
    .select({
      id: trackedAnime.id,
      mediaId: trackedAnime.mediaId,
      title: trackedAnime.title,
      coverImage: trackedAnime.coverImage,
      status: trackedAnime.status,
      pinned: trackedAnime.pinned,
      source: trackedAnime.source,
    })
    .from(trackedAnime)
    .where(eq(trackedAnime.userId, userId));
}

export async function getTrackedIds(userId: string): Promise<number[]> {
  const rows = await db
    .select({ mediaId: trackedAnime.mediaId })
    .from(trackedAnime)
    .where(eq(trackedAnime.userId, userId));
  return rows.map((r) => r.mediaId);
}

export async function addTracked(
  userId: string,
  entry: {
    mediaId: number;
    title: string;
    coverImage?: string | null;
    status?: TrackedStatus;
    source?: "manual" | "anilist";
  },
): Promise<void> {
  await db
    .insert(trackedAnime)
    .values({
      userId,
      mediaId: entry.mediaId,
      title: entry.title,
      coverImage: entry.coverImage ?? null,
      status: entry.status ?? "watching",
      source: entry.source ?? "manual",
    })
    .onConflictDoNothing();
}

export async function updateTracked(
  userId: string,
  mediaId: number,
  patch: { pinned?: boolean; status?: TrackedStatus },
): Promise<void> {
  const values: Partial<typeof trackedAnime.$inferInsert> = {};
  if (patch.pinned !== undefined) values.pinned = patch.pinned;
  if (patch.status !== undefined) values.status = patch.status;
  if (Object.keys(values).length === 0) return;

  await db
    .update(trackedAnime)
    .set(values)
    .where(and(eq(trackedAnime.userId, userId), eq(trackedAnime.mediaId, mediaId)));
}

export async function removeTracked(userId: string, mediaId: number): Promise<void> {
  await db
    .delete(trackedAnime)
    .where(and(eq(trackedAnime.userId, userId), eq(trackedAnime.mediaId, mediaId)));
}
