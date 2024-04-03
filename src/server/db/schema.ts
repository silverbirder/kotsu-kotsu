import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `kotsu-kotsu_${name}`);

export const posts = createTable(
  "post",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }),
    createdById: varchar("createdById", { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updatedAt"),
  },
  (example) => ({
    createdByIdIdx: index("createdById_idx").on(example.createdById),
    nameIndex: index("name_idx").on(example.name),
  })
);

export const users = createTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_userId_idx").on(account.userId),
  })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_userId_idx").on(session.userId),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

export const notebooks = createTable("notebook", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  remark: text("remark"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => users.id),
});

export const entryValueTypeEnum = pgEnum("entryValueType", [
  "number",
  "string",
  "boolean",
  "array",
]);

export const notebookEntries = createTable(
  "notebookEntry",
  {
    id: serial("id").primaryKey(),
    notebookId: integer("notebookId")
      .notNull()
      .references(() => notebooks.id),
    label: varchar("label", { length: 255 }).notNull(),
    valueType: entryValueTypeEnum("entryValueType").notNull(),
  },
  (notebookEntry) => ({
    notebookIdIdx: index("notebookEntry_notebookId_idx").on(
      notebookEntry.notebookId
    ),
  })
);

export const notebookEntryValueArraies = createTable(
  "notebookEntryValueArray",
  {
    id: serial("id").primaryKey(),
    notebookEntryId: integer("notebookEntryId")
      .notNull()
      .references(() => notebookEntries.id),
    value: varchar("value", { length: 255 }).notNull(),
  },
  (notebookEntryValueArray) => ({
    notebookEntryIdIdx: index("notebookEntryValueArray_notebookEntryId_idx").on(
      notebookEntryValueArray.notebookEntryId
    ),
  })
);

export const pages = createTable(
  "page",
  {
    id: serial("id").primaryKey(),
    notebookId: integer("notebookId")
      .notNull()
      .references(() => notebooks.id),
    remark: text("remark"),
    createdAt: timestamp("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id),
  },
  (page) => ({
    notebookIdIdx: index("page_notebookId_idx").on(page.notebookId),
    userIdIdx: index("page_userId_idx").on(page.userId),
  })
);

export const pageEntries = createTable(
  "pageEntry",
  {
    id: serial("id").primaryKey(),
    pageId: integer("pageId")
      .notNull()
      .references(() => pages.id),
    notebookEntryId: integer("notebookEntryId")
      .notNull()
      .references(() => notebookEntries.id),
    stringValue: varchar("stringValue", { length: 255 }),
    numberValue: integer("numberValue"),
    booleanValue: boolean("booleanValue"),
  },
  (pageEntry) => ({
    pageIdIdx: index("pageEntry_pageId_idx").on(pageEntry.pageId),
    notebookEntryIdIdx: index("pageEntry_notebookEntryId_idx").on(
      pageEntry.notebookEntryId
    ),
  })
);
