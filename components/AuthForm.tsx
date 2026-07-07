"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);

    const result =
      mode === "signup"
        ? await signUp.email({ name: name.trim() || email.split("@")[0], email, password })
        : await signIn.email({ email, password });

    setBusy(false);
    if (result.error) {
      setError(result.error.message ?? "Something went wrong");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  const inputClass = "w-full px-3 py-2.5 text-sm";

  return (
    <div className="mx-auto mt-12 w-full max-w-sm">
      <div className="glass glow-accent rounded-2xl p-6">
        <h1 className="text-glow mb-1 text-xl font-bold text-accent-strong">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mb-6 text-sm text-muted">
          {mode === "signup"
            ? "Track countdowns for your own anime list."
            : "Log in to see your countdowns."}
        </p>

        <form onSubmit={submit} className="flex flex-col gap-3">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              autoComplete="name"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClass}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Password (8+ characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className={inputClass}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="glow-accent mt-1 rounded-lg bg-accent px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
          >
            {busy ? "…" : mode === "signup" ? "Sign up" : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-accent-strong hover:underline">
                Log in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link href="/signup" className="text-accent-strong hover:underline">
                Create an account
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
