import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import { type Adapter } from "next-auth/adapters";
import Google from "next-auth/providers/google";

import { env } from "@/env";
import { db } from "@/server/db";
import {
  createTable,
  notebooks,
  notebookEntries,
  notebookEntryValueArraies,
  pages,
  pageEntries,
} from "@/server/db/schema";

const createPageWithEntries = async (
  notebookId: number,
  volumeEntryId: number,
  typeEntryId: number,
  volumeValue: number,
  typeValueId: number,
  userId: string,
  createdAt: Date
) => {
  const pageData = {
    notebookId: notebookId,
    remark: "",
    createdAt: createdAt,
    userId: userId,
  };

  const pageRes = await db
    .insert(pages)
    .values([pageData])
    .onConflictDoNothing()
    .returning();
  const pageId = pageRes[0]?.id ?? 0;

  const pageEntriesData = [
    {
      pageId: pageId,
      notebookEntryId: volumeEntryId,
      numberValue: volumeValue,
    },
    {
      pageId: pageId,
      notebookEntryId: typeEntryId,
      numberValue: typeValueId,
    },
  ];

  await db.insert(pageEntries).values(pageEntriesData);
};

const createInitialNotebookForUser = async (userId: string) => {
  const notebookData = {
    title: "【サンプル】コーヒーを飲んだ記録",
    remark: "",
    createdAt: new Date(),
    userId: userId,
  };
  const notebookRes = await db
    .insert(notebooks)
    .values([notebookData])
    .onConflictDoNothing()
    .returning();
  const notebookId = notebookRes[0]?.id ?? 0;

  const notebookEntriesData = [
    {
      notebookId: notebookId,
      label: "飲んだ量(ml)",
      valueType: "number" as const,
    },
    {
      notebookId: notebookId,
      label: "コーヒーの種類",
      valueType: "array" as const,
    },
  ];
  const entryRes = await db
    .insert(notebookEntries)
    .values(notebookEntriesData)
    .onConflictDoNothing()
    .returning();
  const volumeEntryId = entryRes[0]?.id ?? 0;
  const typeEntryId = entryRes[1]?.id ?? 0;

  const entryValuesData = [
    {
      notebookEntryId: typeEntryId,
      value: "アメリカンコーヒー",
    },
    {
      notebookEntryId: typeEntryId,
      value: "カフェオレ",
    },
    {
      notebookEntryId: typeEntryId,
      value: "エスプレッソ",
    },
  ];
  const entryValuesRes = await db
    .insert(notebookEntryValueArraies)
    .values(entryValuesData)
    .onConflictDoNothing()
    .returning();
  const americanCoffeeId = entryValuesRes[0]?.id ?? 0;
  const cafeAuLaitId = entryValuesRes[1]?.id ?? 0;
  const espressoId = entryValuesRes[2]?.id ?? 0;

  const currentDate = new Date();
  const createEntryDate = (daysAgo: number, hour: number): Date => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(hour, 0, 0, 0);
    return date;
  };

  for (let i = 7; i > 0; i--) {
    // 8 AM American Coffee 250ml
    await createPageWithEntries(
      notebookId,
      volumeEntryId,
      typeEntryId,
      250,
      americanCoffeeId,
      userId,
      createEntryDate(i, 8)
    );

    // 1 PM - Special rule for 4 days ago and 2 days ago
    if (i === 4 || i === 2) {
      await createPageWithEntries(
        notebookId,
        volumeEntryId,
        typeEntryId,
        150,
        cafeAuLaitId,
        userId,
        createEntryDate(i, 13)
      );
    } else {
      await createPageWithEntries(
        notebookId,
        volumeEntryId,
        typeEntryId,
        250,
        americanCoffeeId,
        userId,
        createEntryDate(i, 13)
      );
    }
  }

  // 6 PM Espresso 200ml - for the last 3 days
  for (let i = 3; i > 0; i--) {
    await createPageWithEntries(
      notebookId,
      volumeEntryId,
      typeEntryId,
      200,
      espressoId,
      userId,
      createEntryDate(i, 18)
    );
  }
};

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      await createInitialNotebookForUser(user.id);
    },
  },
  adapter: DrizzleAdapter(db, createTable) as Adapter,
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
});
