import "dotenv/config";
import { db } from "..";
import { env } from "@/env";
import * as schema from "../schema";
import { eq } from "drizzle-orm";

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
    .insert(schema.pages)
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

  await db.insert(schema.pageEntries).values(pageEntriesData);
};

const main = async () => {
  const userId = env.DB_SEED_USER_ID ?? "";
  const existingNotebook = await db
    .select()
    .from(schema.notebooks)
    .where(eq(schema.notebooks.title, "コーヒーを飲んだ記録"));

  if (existingNotebook.length > 0) {
    console.log(
      `Already inserted notebook record (title: コーヒーを飲んだ記録)`
    );
    return true;
  }

  const newNotebookData = {
    title: "コーヒーを飲んだ記録",
    remark: "",
    createdAt: new Date(),
    userId: userId,
  };
  const notebookRes = await db
    .insert(schema.notebooks)
    .values([newNotebookData])
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
    .insert(schema.notebookEntries)
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
    .insert(schema.notebookEntryValueArraies)
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

export default main;
