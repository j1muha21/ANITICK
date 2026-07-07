import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Reuse the connection across dev-server HMR reloads. Keyed by URL so a
// .env.local change (e.g. DATABASE_URL being filled in) drops the stale client.
const globalStore = globalThis as unknown as {
  __anitickPg?: ReturnType<typeof postgres>;
  __anitickPgUrl?: string;
};

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    // postgres() connects lazily, so a placeholder keeps the app importable
    // (public pages work) until the user configures Supabase; any actual
    // query will fail loudly instead.
    console.warn("DATABASE_URL is not set — account features are disabled until it is.");
    return postgres("postgres://unconfigured:unconfigured@127.0.0.1:1/unconfigured", {
      prepare: false,
    });
  }
  // Serverless-friendly settings: one connection per instance (Vercel spins up
  // many instances — driver default of 10 each exhausts Supabase's pooler),
  // released when idle. prepare: false is required by the transaction pooler.
  return postgres(url, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

const currentUrl = process.env.DATABASE_URL ?? "";
if (!globalStore.__anitickPg || globalStore.__anitickPgUrl !== currentUrl) {
  globalStore.__anitickPg = createClient();
  globalStore.__anitickPgUrl = currentUrl;
}
const client = globalStore.__anitickPg;

export const db = drizzle(client, { schema });
export { schema };
