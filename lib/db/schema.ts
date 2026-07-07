import { boolean, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// better-auth core tables (shape expected by the drizzle adapter)
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// AniTick app tables
// ---------------------------------------------------------------------------

export const anilistConnections = pgTable("anilist_connections", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  accessTokenEnc: text("access_token_enc").notNull(),
  anilistUserId: integer("anilist_user_id").notNull(),
  anilistUserName: text("anilist_user_name").notNull(),
  avatar: text("avatar"),
  connectedAt: timestamp("connected_at").notNull().defaultNow(),
});

export const trackedAnime = pgTable(
  "tracked_anime",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    mediaId: integer("media_id").notNull(),
    title: text("title").notNull(),
    coverImage: text("cover_image"),
    status: text("status").notNull().default("watching"), // watching | planning | completed | other
    pinned: boolean("pinned").notNull().default(false),
    source: text("source").notNull().default("manual"), // manual | anilist
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("tracked_anime_user_media_idx").on(t.userId, t.mediaId)],
);

export const userPrefs = pgTable("user_prefs", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  accentColor: text("accent_color").notNull().default("#a64bff"),
  timerStyle: text("timer_style").notNull().default("digital"), // digital | ring | glass | flip
  defaultView: text("default_view").notNull().default("grid"), // grid | list
  notifyEnabled: boolean("notify_enabled").notNull().default(false),
  notifyLeadMin: integer("notify_lead_min").notNull().default(30),
  icsToken: text("ics_token").notNull(),
});
