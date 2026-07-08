"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface Props {
  loggedIn: boolean;
}

export default function MobileNav({ loggedIn }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close on navigation and on outside tap.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    function onTap(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onTap);
    return () => document.removeEventListener("mousedown", onTap);
  }, []);

  const links = [
    { href: "/", label: "Home" },
    { href: "/chart", label: "Seasonal Chart" },
    { href: "/search", label: "Search" },
    ...(loggedIn
      ? [
          { href: "/dashboard", label: "My Countdowns" },
          { href: "/calendar", label: "Calendar" },
          { href: "/stats", label: "Stats" },
          { href: "/settings", label: "Settings" },
        ]
      : [{ href: "/login", label: "Log in" }]),
  ];

  return (
    <div ref={ref} className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
        aria-expanded={open}
        className="glass flex h-9 w-9 items-center justify-center rounded-lg text-lg"
      >
        {open ? "✕" : "☰"}
      </button>

      {open && (
        <nav className="glass-raised absolute inset-x-3 top-full z-30 mt-2 overflow-hidden rounded-2xl py-2 shadow-xl">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block px-5 py-3 text-sm font-medium transition-colors ${
                pathname === href ? "text-accent-strong" : "text-foreground hover:bg-surface-raised"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
