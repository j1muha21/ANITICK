"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function AccountSection({ email }: { email: string }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setBusy(false);
    if (error) {
      setMessage({ ok: false, text: error.message ?? "Could not change password" });
    } else {
      setMessage({ ok: true, text: "Password updated" });
      setCurrentPassword("");
      setNewPassword("");
    }
  }

  async function deleteAccount() {
    setBusy(true);
    const { error } = await authClient.deleteUser();
    setBusy(false);
    if (error) {
      setMessage({ ok: false, text: error.message ?? "Could not delete account" });
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted">Email</p>
        <p className="mt-1 text-sm font-medium">{email}</p>
      </div>

      <form onSubmit={changePassword} className="flex max-w-sm flex-col gap-3">
        <p className="text-xs uppercase tracking-wide text-muted">Change password</p>
        <input
          type="password"
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          className="px-3 py-2 text-sm"
          autoComplete="current-password"
        />
        <input
          type="password"
          placeholder="New password (8+ characters)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
          className="px-3 py-2 text-sm"
          autoComplete="new-password"
        />
        <button
          type="submit"
          disabled={busy}
          className="glass-raised self-start rounded-lg px-4 py-2 text-sm font-medium text-accent-strong transition-all hover:bg-accent hover:text-white disabled:opacity-60"
        >
          Update password
        </button>
      </form>

      {message && (
        <p className={`text-sm ${message.ok ? "text-accent-strong" : "text-red-400"}`}>
          {message.text}
        </p>
      )}

      <div className="border-t border-glass-border pt-4">
        {confirmDelete ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-red-400">
              Delete your account and all tracked anime permanently?
            </span>
            <button
              onClick={deleteAccount}
              disabled={busy}
              className="rounded-lg bg-red-500/80 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
            >
              Yes, delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="glass rounded-lg px-3 py-1.5 text-sm text-muted hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-sm text-red-400/80 hover:text-red-400"
          >
            Delete account…
          </button>
        )}
      </div>
    </div>
  );
}
