import Link from "next/link";
import { getUser } from "@/lib/session";
import UserMenu from "@/components/UserMenu";

export default async function Header() {
  const user = await getUser();

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
          {user && (
            <Link href="/dashboard" className="transition-colors hover:text-foreground">
              My Countdowns
            </Link>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <UserMenu name={user.name} email={user.email} />
          ) : (
            <>
              <Link
                href="/login"
                className="glass rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
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
