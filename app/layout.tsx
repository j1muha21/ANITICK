import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import AutoRefresh from "@/components/AutoRefresh";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</main>
        <footer className="border-t border-surface-raised py-6 text-center text-xs text-muted">
          AniTick · Data from{" "}
          <a href="https://anilist.co" className="text-accent hover:underline">
            AniList
          </a>{" "}
          · Not affiliated with AniList
        </footer>
        <AutoRefresh />
      </body>
    </html>
  );
}
