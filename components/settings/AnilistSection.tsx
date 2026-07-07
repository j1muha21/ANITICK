"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  connection: { userName: string; avatar: string | null } | null;
  /** Result of the OAuth redirect, from ?anilist= in the URL. */
  flash?: "connected" | "error";
}

export default function AnilistSection({ connection, flash }: Props) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(
    flash === "connected"
      ? "AniList connected — run a sync to import your list."
      : flash === "error"
        ? "Connecting to AniList failed. Check that the redirect URL on anilist.co matches exactly, then try again."
        : null,
  );
  const router = useRouter();

  async function sync() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/anilist/sync", { method: "POST" });
      const data = await res.json();
      setMessage(
        res.ok
          ? `Synced ${data.imported} entries from AniList.`
          : (data.error ?? "Sync failed."),
      );
      if (res.ok) router.refresh();
    } catch {
      setMessage("Sync failed.");
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    try {
      await fetch("/api/anilist/disconnect", { method: "POST" });
      setMessage("Disconnected. Your tracked list is kept.");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {connection ? (
        <>
          <div className="flex items-center gap-3">
            {connection.avatar && (
              <Image
                src={connection.avatar}
                alt={connection.userName}
                width={36}
                height={36}
                className="rounded-full"
              />
            )}
            <div>
              <p className="text-sm font-medium">Connected as {connection.userName}</p>
              <p className="text-xs text-muted">
                New additions are mirrored to AniList automatically.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={sync}
              disabled={busy}
              className="glow-accent rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
            >
              {busy ? "Working…" : "Sync now"}
            </button>
            <button
              onClick={disconnect}
              disabled={busy}
              className="glass rounded-lg px-4 py-2 text-sm text-muted transition-colors hover:text-foreground disabled:opacity-60"
            >
              Disconnect
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-muted">
            Connect your AniList account to import your existing list and keep new additions in
            sync. Your AniTick list is stored here either way — disconnecting never deletes it.
          </p>
          <a
            href="/api/anilist/connect"
            className="glow-accent self-start rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
          >
            Connect AniList Account
          </a>
        </>
      )}

      {message && <p className="text-sm text-accent-strong">{message}</p>}
    </div>
  );
}
