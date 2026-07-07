# AniTick ⏱️

A dark, glassy, neon-accented anime episode countdown tracker with its own user
accounts. Data comes from the [AniList GraphQL API](https://docs.anilist.co/);
your tracked list lives in AniTick's own database, with optional AniList
import/sync.

## Features

- **Public countdown feed** — Airing Today, Trending, and next season's most anticipated, each with a live per-second countdown
- **Native accounts** — email/password signup (better-auth); your list is yours, independent of AniList
- **Screensaver Mode** — every anime page is a poster + huge ambient timer in one of **4 switchable styles**: digital clock, circular ring, glass card, retro flip-clock
- **Theming** — one neon accent color (10 presets or any hex) applied across buttons, glows, rings and timers; default timer style; grid/list preference
- **AniList import/sync** (optional) — connect in Settings, one-click import of your whole list; new additions mirror back to AniList
- **Seasonal chart** (`/chart/summer-2026`) — full season with genre/format/sort filters and grid/list toggle
- **Pinned watchlist** — front-and-center shows on your dashboard
- **Weekly calendar** — Mon–Sun view of your tracked airings in your local time
- **Universal search** — the whole AniList catalog
- **Stats** — episodes/hours watched and genre breakdown (lifetime via AniList when connected, otherwise from your tracked list)
- **Notifications** — browser heads-up N minutes before tracked episodes air (while the app is open)
- **Calendar export** — private subscribable `.ics` feed for Google/Apple Calendar
- **PWA** — installable, with an offline shell

## Setup

### 1. Supabase (database)

1. Create a free project at <https://supabase.com>
2. Click **Connect** → copy the **Session pooler** connection string (URI)
3. That's your `DATABASE_URL` (put your DB password in it)

### 2. AniList API client (optional — only for import/sync)

1. Go to <https://anilist.co/settings/developer> → **Create New Client**
2. Set the redirect URL to exactly: `http://localhost:3000/api/anilist/callback`
   — OAuth fails with `invalid_client`/redirect errors if this is missing or different
3. Note the Client ID and Secret

### 3. Environment

Copy `.env.example` to `.env.local` and fill it in:

```bash
ANILIST_CLIENT_ID=...
ANILIST_CLIENT_SECRET=...
ANILIST_REDIRECT_URI=http://localhost:3000/api/anilist/callback
DATABASE_URL=postgresql://postgres.xxxx:PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres
BETTER_AUTH_SECRET=<random 32+ chars>
BETTER_AUTH_URL=http://localhost:3000
SESSION_SECRET=<random 32+ chars>
```

Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

### 4. Create tables & run

```bash
npm install
npx drizzle-kit push   # creates all tables in Supabase (reads DATABASE_URL from the env)
npm run dev
```

Open <http://localhost:3000>, click **Sign up**, and start tracking.

> On Windows/bash, prefix the push with the env var if it isn't picked up:
> `DATABASE_URL="postgresql://..." npx drizzle-kit push`

## Architecture

| Piece | Where | Notes |
| --- | --- | --- |
| App auth | `lib/auth.ts`, `app/api/auth/[...all]` | better-auth email/password, session cookies, CSRF origin checks |
| Database | `lib/db/schema.ts` (Drizzle + Postgres) | auth tables + `tracked_anime`, `anilist_connections`, `user_prefs` |
| AniList client | `lib/anilist/` | public queries cached in-process 15–30 min (rate-limit safety); authed queries never cached |
| AniList OAuth | `app/api/anilist/{connect,callback,sync,disconnect}` | tokens encrypted (jose A256GCM) into the DB; app list is the source of truth |
| Timers | `components/timers/` | one `useCountdown` hook driving 4 styles |
| Theming | `app/globals.css`, `/api/prefs` | one `--accent` CSS var; prefs in DB + cookie for instant server paint |
| Notifications | `components/NotificationScheduler.tsx` | Notification API, lead time from prefs, dedupe via localStorage |
| Calendar feed | `app/api/ics/[token]` | tokened URL — treat it like a password |
| PWA | `app/manifest.ts`, `public/sw.js` | network-first pages, cache-first static, never intercepts `/api/*` |

## Deploying (Vercel)

1. Import the repo, add all env vars (change both URLs to your production domain)
2. Add the production callback (`https://your-app.vercel.app/api/anilist/callback`) as a **second** AniList client, or swap the URL — AniList allows one redirect URL per client
3. Supabase works as-is (the pooler connection string is serverless-friendly)

## Known limitations

- **No streaming links** — AniList's API doesn't expose platform availability (Crunchyroll etc.)
- **Airing accuracy** — depends on AniList; occasionally lags on last-minute delays
- **Notifications** fire only while AniTick is open in a tab — real push needs a push server (future work)
- **Supabase free tier** pauses after ~1 week of inactivity; resume it from the dashboard
