import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { anilistConnections } from "@/lib/db/schema";
import { openToken, sealToken } from "@/lib/session";

export interface AniListConnection {
  anilistUserId: number;
  anilistUserName: string;
  avatar: string | null;
  accessToken: string;
}

export async function getConnection(userId: string): Promise<AniListConnection | null> {
  const [row] = await db
    .select()
    .from(anilistConnections)
    .where(eq(anilistConnections.userId, userId));
  if (!row) return null;

  const accessToken = await openToken(row.accessTokenEnc);
  if (!accessToken) return null; // secret changed or corrupt — treat as disconnected

  return {
    anilistUserId: row.anilistUserId,
    anilistUserName: row.anilistUserName,
    avatar: row.avatar,
    accessToken,
  };
}

export async function saveConnection(
  userId: string,
  data: { accessToken: string; anilistUserId: number; anilistUserName: string; avatar: string | null },
): Promise<void> {
  const accessTokenEnc = await sealToken(data.accessToken);
  await db
    .insert(anilistConnections)
    .values({
      userId,
      accessTokenEnc,
      anilistUserId: data.anilistUserId,
      anilistUserName: data.anilistUserName,
      avatar: data.avatar,
    })
    .onConflictDoUpdate({
      target: anilistConnections.userId,
      set: {
        accessTokenEnc,
        anilistUserId: data.anilistUserId,
        anilistUserName: data.anilistUserName,
        avatar: data.avatar,
        connectedAt: new Date(),
      },
    });
}

export async function deleteConnection(userId: string): Promise<void> {
  await db.delete(anilistConnections).where(eq(anilistConnections.userId, userId));
}
