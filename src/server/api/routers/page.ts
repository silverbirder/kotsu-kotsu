import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  pages,
  pageEntries,
  notebookEntries,
  notebookEntryValueArraies,
} from "@/server/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

export const pageRouter = createTRPCRouter({
  getList: protectedProcedure
    .input(z.object({ notebookId: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.session.user;
      return await ctx.db
        .select()
        .from(pages)
        .where(
          and(eq(pages.userId, user.id), eq(pages.notebookId, input.notebookId))
        );
    }),
  getDetail: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.session.user;
      const info = await ctx.db
        .select()
        .from(pages)
        .where(and(eq(pages.userId, user.id), eq(pages.id, input.id)))
        .limit(1);
      const entries = await ctx.db
        .select()
        .from(pages)
        .innerJoin(
          notebookEntries,
          and(eq(pages.notebookId, notebookEntries.notebookId))
        )
        .leftJoin(
          pageEntries,
          and(
            eq(pages.id, pageEntries.pageId),
            eq(notebookEntries.id, pageEntries.notebookEntryId)
          )
        )
        .where(and(eq(pages.userId, user.id), eq(pages.id, input.id)));
      const selectableEntries = entries
        .filter((entry) => entry.notebookEntry.valueType === "array")
        .map((entry) => entry.notebookEntry.id);
      if (selectableEntries.length === 0) {
        return { info: info[0], entries: entries, select: [] };
      }
      const select = await ctx.db
        .select()
        .from(notebookEntryValueArraies)
        .where(
          inArray(notebookEntryValueArraies.notebookEntryId, selectableEntries)
        );
      return { info: info[0], entries: entries, select: select };
    }),
  create: protectedProcedure
    .input(
      z.object({
        notebookId: z.number(),
        createdAt: z.date(),
        entries: z.array(
          z.object({
            notebookEntryId: z.number(),
            stringValue: z.string().nullable().nullish(),
            numberValue: z.number().nullable().nullish(),
            booleanValue: z.boolean().nullable().nullish(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let pageId: number | undefined;
      await ctx.db.transaction(async (tx) => {
        const pagesRes = await tx
          .insert(pages)
          .values([
            {
              userId: ctx.session.user.id,
              notebookId: input.notebookId,
              createdAt: input.createdAt,
            },
          ])
          .returning();
        const page = pagesRes[0];
        pageId = page?.id;
        await tx.insert(pageEntries).values(
          input.entries.map((entry) => ({
            ...entry,
            pageId: pageId ?? 0,
          }))
        );
      });
      return {
        pageId,
      };
    }),
  update: protectedProcedure
    .input(
      z.object({
        notebookId: z.number(),
        pageId: z.number(),
        createdAt: z.date(),
        entries: z.array(
          z.object({
            notebookEntryId: z.number(),
            pageEntryId: z.number(),
            stringValue: z.string().nullable().nullish(),
            numberValue: z.number().nullable().nullish(),
            booleanValue: z.boolean().nullable().nullish(),
            valueType: z.enum(["string", "number", "boolean", "array"]),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let status = 500;
      await ctx.db.transaction(async (tx) => {
        const res = await tx
          .select()
          .from(pages)
          .where(
            and(
              eq(pages.id, input.pageId),
              eq(pages.userId, ctx.session.user.id)
            )
          );
        if (res.length === 0) {
          status = 404;
          return;
        }
        await tx
          .update(pages)
          .set({
            createdAt: input.createdAt,
          })
          .where(
            and(
              eq(pages.id, input.pageId),
              eq(pages.userId, ctx.session.user.id)
            )
          );
        for (const entry of input.entries) {
          if (entry.valueType !== "array") {
            await tx
              .update(pageEntries)
              .set({
                stringValue: entry.stringValue,
                numberValue: entry.numberValue,
                booleanValue: entry.booleanValue,
              })
              .where(
                and(
                  eq(pageEntries.id, entry.pageEntryId),
                  eq(pageEntries.pageId, input.pageId)
                )
              );
          }
        }
        const entries = await tx
          .select()
          .from(pageEntries)
          .leftJoin(
            notebookEntries,
            eq(notebookEntries.id, pageEntries.notebookEntryId)
          )
          .where(eq(pageEntries.pageId, input.pageId));

        const entriesArray = input.entries.filter(
          (entry) => entry.valueType === "array"
        );
        const pageEntryIds = entries
          .filter((entry) => entry.notebookEntry?.valueType === "array")
          .map((entry) => entry.pageEntry.id);
        if (pageEntryIds.length > 0) {
          await tx
            .delete(pageEntries)
            .where(
              and(
                inArray(pageEntries.id, pageEntryIds),
                eq(pageEntries.pageId, input.pageId)
              )
            );
        }
        if (entriesArray.length > 0) {
          await tx.insert(pageEntries).values(
            entriesArray.map((x) => {
              return {
                pageId: input.pageId,
                notebookEntryId: x.notebookEntryId,
                numberValue: x.numberValue,
              };
            })
          );
        }
        status = 200;
      });
      return { status };
    }),
  deleteOne: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const pageId = input.id;
      let status = 500;
      await ctx.db.transaction(async (tx) => {
        const data = await tx
          .select({
            id: pages.id,
          })
          .from(pages)
          .where(
            and(eq(pages.userId, ctx.session.user.id), eq(pages.id, pageId))
          );
        if (!data || data.length === 0) {
          status = 404;
          return;
        }
        const pageEntryIds = await tx
          .select({
            id: pageEntries.id,
          })
          .from(pageEntries)
          .where(eq(pageEntries.pageId, pageId));
        const uniqPageEntryIds = unique(pageEntryIds.map((x) => x.id));
        if (uniqPageEntryIds.length > 0) {
          await tx
            .delete(pageEntries)
            .where(inArray(pageEntries.id, uniqPageEntryIds));
        }
        await tx.delete(pages).where(eq(pages.id, pageId));
        status = 200;
      });
      return { status };
    }),
});

const unique = (ary: number[]): number[] => {
  return Array.from(new Set(ary));
};
