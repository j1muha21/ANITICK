import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AccountSection from "@/components/settings/AccountSection";
import AnilistSection from "@/components/settings/AnilistSection";
import AppearanceSection from "@/components/settings/AppearanceSection";
import IcsSection from "@/components/settings/IcsSection";
import NotificationsSection from "@/components/settings/NotificationsSection";
import SettingsCard from "@/components/settings/SettingsCard";
import { getConnection } from "@/lib/anilist/connection";
import { getPrefs } from "@/lib/prefs";
import { getUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ anilist?: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  const [connection, prefs, { anilist }] = await Promise.all([
    getConnection(user.id),
    getPrefs(user.id),
    searchParams,
  ]);
  const flash = anilist === "connected" ? "connected" : anilist === "error" ? "error" : undefined;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">App Settings</h1>
      <div className="flex flex-col gap-6">
        <SettingsCard title="Account" subtitle="Manage your AniTick account">
          <AccountSection email={user.email} />
        </SettingsCard>

        <SettingsCard
          title="AniList Connection"
          subtitle="Import and sync your AniList library"
        >
          <AnilistSection
            connection={
              connection
                ? { userName: connection.anilistUserName, avatar: connection.avatar }
                : null
            }
            flash={flash}
          />
        </SettingsCard>

        <SettingsCard
          title="Appearance & Theme"
          subtitle="One neon accent, applied across buttons, glows and timers"
        >
          <AppearanceSection
            accentColor={prefs.accentColor}
            timerStyle={prefs.timerStyle}
            defaultView={prefs.defaultView}
          />
        </SettingsCard>

        <SettingsCard
          title="Notifications"
          subtitle="Browser heads-up before tracked episodes air"
        >
          <NotificationsSection enabled={prefs.notifyEnabled} leadMin={prefs.notifyLeadMin} />
        </SettingsCard>

        <SettingsCard title="Calendar Export" subtitle="Subscribe from Google or Apple Calendar">
          <IcsSection token={prefs.icsToken} />
        </SettingsCard>
      </div>
    </div>
  );
}
