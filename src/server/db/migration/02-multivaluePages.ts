import "dotenv/config";
import { db } from "..";
import { env } from "@/env";
import * as schema from "../schema";
import { eq } from "drizzle-orm";

const main = async () => {
  const myUserId = env.DB_SEED_USER_ID ?? "";
  const res = await db
    .select()
    .from(schema.notebooks)
    .where(eq(schema.notebooks.title, "錠剤を飲んだ記録"));
  if (res.length > 0) {
    console.log(`Already inserted notebook record (title: 錠剤を飲んだ記録)`);
    return true;
  }

  const notebooksData = [
    {
      title: "錠剤を飲んだ記録",
      remark: "これはメモだ",
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
      label: "錠剤を飲んだ数",
      valueType: "number" as const,
    },
    {
      notebookId: notebookId,
      label: "錠剤の種類",
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

  const notebookEntryValueArraiesData = [
    {
      notebookEntryId: notebookEntrySecondId,
      value: "パブロン",
    },
    {
      notebookEntryId: notebookEntrySecondId,
      value: "アレグラ",
    },
  ];
  const notebookEntryValueArrayRes = await db
    .insert(schema.notebookEntryValueArraies)
    .values(notebookEntryValueArraiesData)
    .onConflictDoNothing()
    .returning();
  const notebookEntryValueArrayFirstId = notebookEntryValueArrayRes[0]?.id ?? 0;

  await createPages({
    notebookEntryFirstId,
    notebookEntrySecondId,
    notebookEntryValueArrayFirstId,
    pageData: {
      notebookId: notebookId,
      createdAt: new Date("2024-04-11 17:00:00"),
      userId: myUserId,
    },
  });
  await createPages({
    notebookEntryFirstId,
    notebookEntrySecondId,
    notebookEntryValueArrayFirstId,
    pageData: {
      notebookId: notebookId,
      createdAt: new Date("2024-04-12 14:00:00"),
      userId: myUserId,
    },
  });
  await createPages({
    notebookEntryFirstId,
    notebookEntrySecondId,
    notebookEntryValueArrayFirstId,
    pageData: {
      notebookId: notebookId,
      createdAt: new Date("2024-04-16 11:00:00"),
      userId: myUserId,
    },
  });
  await createPages({
    notebookEntryFirstId,
    notebookEntrySecondId,
    notebookEntryValueArrayFirstId,
    pageData: {
      notebookId: notebookId,
      createdAt: new Date("2024-04-18 10:00:00"),
      userId: myUserId,
    },
  });
  await createPages({
    notebookEntryFirstId,
    notebookEntrySecondId,
    notebookEntryValueArrayFirstId,
    pageData: {
      notebookId: notebookId,
      createdAt: new Date("2024-05-01 11:00:00"),
      userId: myUserId,
    },
  });
  await createPages({
    notebookEntryFirstId,
    notebookEntrySecondId,
    notebookEntryValueArrayFirstId,
    pageData: {
      notebookId: notebookId,
      createdAt: new Date("2024-05-01 13:00:00"),
      userId: myUserId,
    },
  });
  await createPages({
    notebookEntryFirstId,
    notebookEntrySecondId,
    notebookEntryValueArrayFirstId,
    pageData: {
      notebookId: notebookId,
      createdAt: new Date("2024-05-30 10:00:00"),
      userId: myUserId,
    },
  });
};

const createPages = async ({
  notebookEntryFirstId,
  notebookEntrySecondId,
  notebookEntryValueArrayFirstId,
  pageData,
}: {
  notebookEntryFirstId: number;
  notebookEntrySecondId: number;
  notebookEntryValueArrayFirstId: number;
  pageData: { notebookId: number; createdAt: Date; userId: string };
}) => {
  const pageRes = await db
    .insert(schema.pages)
    .values(pageData)
    .onConflictDoNothing()
    .returning();
  const pageId = pageRes[0]?.id ?? 0;

  const pageEntriesData = [
    {
      pageId: pageId,
      notebookEntryId: notebookEntryFirstId,
      numberValue: 1,
    },
    {
      pageId: pageId,
      notebookEntryId: notebookEntrySecondId,
      numberValue: notebookEntryValueArrayFirstId,
    },
  ];
  await db.insert(schema.pageEntries).values(pageEntriesData);
};
export default main;
