import { NextResponse } from "next/server";
import { deleteConnection } from "@/lib/anilist/connection";
import { getUser } from "@/lib/session";

export async function POST() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  await deleteConnection(user.id);
  return NextResponse.json({ ok: true });
}
