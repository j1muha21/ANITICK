import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { userPrefs } from "@/lib/db/schema";

export interface Prefs {
  accentColor: string;
  timerStyle: "digital" | "ring" | "glass" | "flip";
  defaultView: "grid" | "list";
  notifyEnabled: boolean;
  notifyLeadMin: number;
  icsToken: string;
}

export const DEFAULT_PREFS: Omit<Prefs, "icsToken"> = {
  accentColor: "#a64bff",
  timerStyle: "digital",
  defaultView: "grid",
  notifyEnabled: false,
  notifyLeadMin: 30,
};

/** Read (creating on first use) the user's preferences row. */
export async function getPrefs(userId: string): Promise<Prefs> {
  const [row] = await db.select().from(userPrefs).where(eq(userPrefs.userId, userId));
  if (row) return row as Prefs;

  const fresh = { userId, ...DEFAULT_PREFS, icsToken: randomBytes(20).toString("hex") };
  await db.insert(userPrefs).values(fresh).onConflictDoNothing();
  return fresh;
}

export async function updatePrefs(
  userId: string,
  patch: Partial<Omit<Prefs, "icsToken">>,
): Promise<void> {
  await getPrefs(userId); // ensure the row exists
  await db.update(userPrefs).set(patch).where(eq(userPrefs.userId, userId));
}
