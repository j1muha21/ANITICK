import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/session";

export default async function Header() {
  const session = await getSession();

  return (
    <header className="glass sticky top-0 z-20 border-x-0 border-t-0">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
        <Link href="/" className="text-glow text-xl font-black tracking-tight text-accent">
          Ani<span className="text-foreground">Tick</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-muted">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <Link href="/chart" className="transition-colors hover:text-foreground">
            Seasonal Chart
          </Link>
          {session && (
            <Link href="/dashboard" className="transition-colors hover:text-foreground">
              My Countdowns
            </Link>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {session ? (
            <>
              <span className="hidden items-center gap-2 text-sm sm:flex">
                {session.avatar && (
                  <Image
                    src={session.avatar}
                    alt={session.userName}
                    width={28}
                    height={28}
                    className="rounded-full"
                  />
                )}
                {session.userName}
              </span>
              <a
                href="/api/auth/logout"
                className="glass rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
              >
                Log out
              </a>
            </>
          ) : (
            <a
              href="/api/auth/login"
              className="glow-accent rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
            >
              Connect AniList
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
