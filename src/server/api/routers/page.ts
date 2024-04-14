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
        .innerJoin(
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
});
