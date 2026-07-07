"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  enabled: boolean;
  leadMin: number;
}

export default function NotificationsSection({ enabled, leadMin }: Props) {
  const [on, setOn] = useState(enabled);
  const [lead, setLead] = useState(leadMin);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function save(patch: Record<string, unknown>) {
    await fetch("/api/prefs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    router.refresh();
  }

  async function toggle() {
    if (!on) {
      if (typeof Notification === "undefined") {
        setMessage("This browser doesn't support notifications.");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Notifications are blocked — allow them in your browser's site settings.");
        return;
      }
    }
    setOn(!on);
    setMessage(null);
    void save({ notifyEnabled: !on });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Episode notifications</p>
          <p className="text-xs text-muted">
            Fires while AniTick is open in a tab — heads-up before tracked episodes air.
          </p>
        </div>
        <button
          onClick={toggle}
          role="switch"
          aria-checked={on}
          className={`relative h-7 w-12 rounded-full transition-colors ${
            on ? "glow-accent bg-accent" : "bg-surface-raised"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
              on ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>

      {on && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">Notify me</span>
          <input
            type="number"
            min={5}
            max={720}
            value={lead}
            onChange={(e) => setLead(Number(e.target.value))}
            onBlur={() => {
              const v = Math.min(720, Math.max(5, Math.round(lead) || 30));
              setLead(v);
              void save({ notifyLeadMin: v });
            }}
            className="w-20 px-3 py-1.5 text-sm"
            aria-label="Lead time in minutes"
          />
          <span className="text-sm text-muted">minutes before airing</span>
        </div>
      )}

      {message && <p className="text-sm text-red-400">{message}</p>}
    </div>
  );
}
