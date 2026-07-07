# AniTick ⏱️

Live countdowns to the next episode of every airing anime, powered by the
[AniList GraphQL API](https://docs.anilist.co/). Connect your AniList account to get
countdowns for your own **Watching** and **Planning** lists.

## Features

- **Home** — Airing Today (next 24h), Trending Now, and next season's most anticipated shows, each with a live `DD HH:MM:SS` countdown to the next episode
- **Seasonal chart** (`/chart/summer-2026`) — every anime in a season, with genre/format/sort filters and a grid/list view toggle (AniChart-style)
- **Anime detail pages** — synopsis, format, episodes, studio, score, and the full upcoming airing schedule with countdowns
- **AniList login** (OAuth2) — personalized `/dashboard` built from your Watching + Planning lists, plus one-click "Add to Planning" on any card
- Schedule data is cached in-memory for 15–30 min to stay well under AniList's rate limit, and pages auto-refresh hourly to catch schedule changes

## Setup

### 1. Create an AniList API client

1. Go to <https://anilist.co/settings/developer>
2. Click **Create New Client**
3. Set the redirect URL to exactly: `http://localhost:3000/api/auth/callback`
4. Note the **Client ID** and **Client Secret**

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill it in:

```bash
ANILIST_CLIENT_ID=your_client_id
ANILIST_CLIENT_SECRET=your_client_secret
ANILIST_REDIRECT_URI=http://localhost:3000/api/auth/callback
SESSION_SECRET=any_random_32+_char_string
```

Generate a session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

`.env.local` is gitignored — never commit real credentials.

### 3. Run it

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. Browsing works without an account; click
**Connect AniList** to log in and unlock the dashboard.

## Deploying (Vercel)

1. Import the repo into Vercel
2. Add the four env vars above in Project Settings, changing
   `ANILIST_REDIRECT_URI` to `https://your-app.vercel.app/api/auth/callback`
3. Add that same URL as the redirect URL in your AniList API client settings
   (AniList clients accept one redirect URL — create a second client for
   production if you want to keep local dev working)

## How it works

| Piece | Where | Notes |
| --- | --- | --- |
| GraphQL client + cache | `lib/anilist/client.ts`, `lib/cache.ts` | Public queries memoized in-process with a TTL; authed queries never cached |
| Queries/mutations | `lib/anilist/queries.ts` | Trending, airing schedule, seasonal, detail, viewer, media list, add-to-planning |
| OAuth | `app/api/auth/*` | Authorization-code flow with a `state` check; the client secret is only used server-side in the callback route |
| Sessions | `lib/session.ts` | Access token encrypted (`jose`, A256GCM) into an httpOnly cookie — nothing in localStorage |
| Countdowns | `components/CountdownTimer.tsx` | Ticks every second from AniList's `airingAt`; refreshes page data when an episode airs |

## Known limitations

- **No streaming links** — AniList's API doesn't expose platform availability (Crunchyroll etc.); a future version could layer in another data source
- **Airing accuracy** — times come from AniList and are generally reliable for JP broadcast, but can lag on last-minute delays
- AniList allows one redirect URL per API client, so local dev and production need separate clients (or switch the URL when deploying)
