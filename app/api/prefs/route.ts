import { NextRequest, NextResponse } from "next/server";
import { updatePrefs, type Prefs } from "@/lib/prefs";
import { getUser } from "@/lib/session";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const TIMER_STYLES = ["digital", "ring", "glass", "flip"] as const;
const VIEWS = ["grid", "list"] as const;

export async function PATCH(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const patch: Partial<Omit<Prefs, "icsToken">> = {};

  if (typeof body.accentColor === "string" && HEX_RE.test(body.accentColor)) {
    patch.accentColor = body.accentColor.toLowerCase();
  }
  if (TIMER_STYLES.includes(body.timerStyle)) patch.timerStyle = body.timerStyle;
  if (VIEWS.includes(body.defaultView)) patch.defaultView = body.defaultView;
  if (typeof body.notifyEnabled === "boolean") patch.notifyEnabled = body.notifyEnabled;
  if (
    typeof body.notifyLeadMin === "number" &&
    Number.isInteger(body.notifyLeadMin) &&
    body.notifyLeadMin >= 5 &&
    body.notifyLeadMin <= 720
  ) {
    patch.notifyLeadMin = body.notifyLeadMin;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  await updatePrefs(user.id, patch);

  const res = NextResponse.json({ ok: true });
  if (patch.accentColor) {
    // Mirror to a cookie so the server layout can paint --accent instantly.
    res.cookies.set("anitick_accent", patch.accentColor, {
      path: "/",
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60,
    });
  }
  return res;
}
