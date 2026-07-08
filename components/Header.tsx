import Link from "next/link";
import { getUser } from "@/lib/session";
import MobileNav from "@/components/MobileNav";
import SearchBar from "@/components/SearchBar";
import UserMenu from "@/components/UserMenu";

export default async function Header() {
  const user = await getUser();

  return (
    <header className="glass sticky top-0 z-20 border-x-0 border-t-0">
      <div className="relative mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-6">
        <MobileNav loggedIn={Boolean(user)} />
        <Link href="/" className="text-glow text-xl font-black tracking-tight text-accent">
          Ani<span className="text-foreground">Tick</span>
        </Link>
        <nav className="hidden items-center gap-4 text-sm font-medium text-muted md:flex">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <Link href="/chart" className="transition-colors hover:text-foreground">
            Seasonal Chart
          </Link>
          {user && (
            <>
              <Link href="/dashboard" className="transition-colors hover:text-foreground">
                My Countdowns
              </Link>
              <Link href="/calendar" className="transition-colors hover:text-foreground">
                Calendar
              </Link>
              <Link href="/stats" className="transition-colors hover:text-foreground">
                Stats
              </Link>
            </>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <SearchBar />
          <Link
            href="/search"
            aria-label="Search"
            className="glass flex h-9 w-9 items-center justify-center rounded-lg text-lg text-muted transition-colors hover:text-foreground md:hidden"
          >
            ⌕
          </Link>
          {user ? (
            <UserMenu name={user.name} email={user.email} />
          ) : (
            <>
              <Link
                href="/login"
                className="glass hidden rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground sm:block"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="glow-accent rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
