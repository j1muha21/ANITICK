"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

interface Props {
  name: string;
  email: string;
}

export default function UserMenu({ name, email }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  const initial = (name || email).charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full p-1 pr-3 text-sm transition-colors hover:bg-surface-raised"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="glow-accent flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
          {initial}
        </span>
        <span className="hidden max-w-28 truncate sm:inline">{name}</span>
      </button>

      {open && (
        <div className="glass-raised absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-xl py-1 text-sm shadow-xl">
          <p className="truncate px-4 py-2 text-xs text-muted">{email}</p>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 hover:bg-surface-raised"
          >
            My Countdowns
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 hover:bg-surface-raised"
          >
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="block w-full px-4 py-2 text-left text-muted hover:bg-surface-raised hover:text-foreground"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
