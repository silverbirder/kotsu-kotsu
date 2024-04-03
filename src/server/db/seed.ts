import "dotenv/config";
import { db } from ".";
import { env } from "@/env";
import * as schema from "./schema";
import { eq } from "drizzle-orm";

if (!env.DATABASE_URL) throw new Error("DATABASE_URL not found on .env");
if (!env.DB_SEED_USER_ID) throw new Error("DB_SEED_USER_ID not found on .env");
const main = async () => {
  console.log("Seed start");

  const myUserId = env.DB_SEED_USER_ID ?? "";

  const res = await db
    .select()
    .from(schema.notebooks)
    .where(eq(schema.notebooks.title, "Notebook One"));
  if (res.length > 0) {
    console.log(`Already inserted notebook record (title: Notebook One)`);
    return true;
  }

  const notebooksData = [
    {
      title: "Notebook One",
      remark: "This is the first notebook",
      createdAt: new Date(),
      userId: myUserId,
    },
  ];
  const notebookRes = await db
    .insert(schema.notebooks)
    .values(notebooksData)
    .onConflictDoNothing()
    .returning();
  const notebookId = notebookRes[0]?.id ?? 0;

  const notebookEntriesData = [
    {
      notebookId: notebookId,
      label: "first label",
      valueType: "string" as const,
    },
    {
      notebookId: notebookId,
      label: "second label",
      valueType: "number" as const,
    },
    {
      notebookId: notebookId,
      label: "third label",
      valueType: "boolean" as const,
    },
    {
      notebookId: notebookId,
      label: "forth label",
      valueType: "array" as const,
    },
  ];
  const notebookEntryRes = await db
    .insert(schema.notebookEntries)
    .values(notebookEntriesData)
    .onConflictDoNothing()
    .returning();
  const notebookEntryFirstId = notebookEntryRes[0]?.id ?? 0;
  const notebookEntrySecondId = notebookEntryRes[1]?.id ?? 0;
  const notebookEntryThirdId = notebookEntryRes[2]?.id ?? 0;
  const notebookEntryForthId = notebookEntryRes[3]?.id ?? 0;

  const notebookEntryValueArraiesData = [
    {
      notebookEntryId: notebookEntryForthId,
      value: "select 1",
    },
    {
      notebookEntryId: notebookEntryForthId,
      value: "select 2",
    },
    {
      notebookEntryId: notebookEntryForthId,
      value: "select 3",
    },
    {
      notebookEntryId: notebookEntryForthId,
      value: "select 4",
    },
  ];
  const notebookEntryValueArrayRes = await db
    .insert(schema.notebookEntryValueArraies)
    .values(notebookEntryValueArraiesData)
    .onConflictDoNothing()
    .returning();
  const notebookEntryValueArrayId = notebookEntryValueArrayRes[0]?.id ?? 0;

  const pagesData = [
    {
      notebookId: notebookId,
      remark: "Page 1 of Notebook 1",
      createdAt: new Date(),
      userId: myUserId,
    },
  ];
  const pageRes = await db
    .insert(schema.pages)
    .values(pagesData)
    .onConflictDoNothing()
    .returning();
  const pageId = pageRes[0]?.id ?? 0;

  const pageEntriesData = [
    {
      pageId: pageId,
      notebookEntryId: notebookEntryFirstId,
      stringValue: "stringValue",
    },
    { pageId: pageId, notebookEntryId: notebookEntrySecondId, numberValue: 1 },
    {
      pageId: pageId,
      notebookEntryId: notebookEntryThirdId,
      booleanValue: true,
    },
    {
      pageId: pageId,
      notebookEntryId: notebookEntryForthId,
      numberValue: notebookEntryValueArrayId,
    },
  ];
  await db.insert(schema.pageEntries).values(pageEntriesData);

  console.log("Seed done");
};

await main();
