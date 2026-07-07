import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AccountSection from "@/components/settings/AccountSection";
import SettingsCard from "@/components/settings/SettingsCard";
import { getUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">App Settings</h1>
      <div className="flex flex-col gap-6">
        <SettingsCard title="Account" subtitle="Manage your AniTick account">
          <AccountSection email={user.email} />
        </SettingsCard>

        <SettingsCard
          title="AniList Connection"
          subtitle="Import and sync your AniList library (coming in the next stage)"
        >
          <p className="text-sm text-muted">Not connected.</p>
        </SettingsCard>

        <SettingsCard
          title="Appearance & Theme"
          subtitle="Accent color and countdown timer style (coming soon)"
        >
          <p className="text-sm text-muted">Defaults active: neon purple, digital timer.</p>
        </SettingsCard>
      </div>
    </div>
  );
}
