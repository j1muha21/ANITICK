import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import Header from "@/components/Header";
import AutoRefresh from "@/components/AutoRefresh";
import NotificationsProvider from "@/components/NotificationsProvider";
import RegisterSW from "@/components/RegisterSW";

const ACCENT_COOKIE = "anitick_accent";
const ACCENT_RE = /^#[0-9a-fA-F]{6}$/;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AniTick — Anime Episode Countdowns",
    template: "%s · AniTick",
  },
  description:
    "Live countdowns to the next episode of every airing anime, powered by AniList. Connect your AniList account to track your own watching and planning lists.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const accent = (await cookies()).get(ACCENT_COOKIE)?.value;
  const accentStyle =
    accent && ACCENT_RE.test(accent) ? ({ "--accent": accent } as React.CSSProperties) : undefined;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={accentStyle}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</main>
        <footer className="border-t border-glass-border pt-6 text-center text-xs text-muted pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          AniTick · Data from{" "}
          <a href="https://anilist.co" className="text-accent hover:underline">
            AniList
          </a>{" "}
          · Not affiliated with AniList
        </footer>
        <AutoRefresh />
        <NotificationsProvider />
        <RegisterSW />
      </body>
    </html>
  );
}
