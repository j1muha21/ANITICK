import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My Countdowns" };

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <>
      <h1 className="mb-1 text-2xl font-bold">My Countdowns</h1>
      <p className="mb-8 text-sm text-muted">Welcome, {user.name}.</p>

      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-sm text-muted">
          Your tracked list is coming in the next build stage. Meanwhile, browse the{" "}
          <Link href="/chart" className="text-accent-strong hover:underline">
            seasonal chart
          </Link>{" "}
          or the{" "}
          <Link href="/" className="text-accent-strong hover:underline">
            countdown feed
          </Link>
          .
        </p>
      </div>
    </>
  );
}
