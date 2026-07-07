import { NextRequest, NextResponse } from "next/server";
import { addTracked, removeTracked, updateTracked } from "@/lib/list";
import { getUser } from "@/lib/session";

const STATUSES = ["watching", "planning", "completed", "other"] as const;
type Status = (typeof STATUSES)[number];

function isStatus(v: unknown): v is Status {
  return typeof v === "string" && (STATUSES as readonly string[]).includes(v);
}

function validMediaId(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v > 0;
}

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!validMediaId(body?.mediaId) || typeof body?.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "mediaId and title are required" }, { status: 400 });
  }

  await addTracked(user.id, {
    mediaId: body.mediaId,
    title: body.title.slice(0, 300),
    coverImage: typeof body.coverImage === "string" ? body.coverImage : null,
    status: isStatus(body.status) ? body.status : undefined,
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!validMediaId(body?.mediaId)) {
    return NextResponse.json({ error: "mediaId is required" }, { status: 400 });
  }

  await updateTracked(user.id, body.mediaId, {
    pinned: typeof body.pinned === "boolean" ? body.pinned : undefined,
    status: isStatus(body.status) ? body.status : undefined,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!validMediaId(body?.mediaId)) {
    return NextResponse.json({ error: "mediaId is required" }, { status: 400 });
  }

  await removeTracked(user.id, body.mediaId);
  return NextResponse.json({ ok: true });
}
