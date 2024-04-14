import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  notebookEntries,
  notebookEntryValueArraies,
  notebooks,
} from "@/server/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

export const notebookRouter = createTRPCRouter({
  getList: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    return await ctx.db
      .select()
      .from(notebooks)
      .where(eq(notebooks.userId, user.id));
  }),
  getDetail: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.session.user;
      const entries = await ctx.db
        .select()
        .from(notebooks)
        .innerJoin(
          notebookEntries,
          eq(notebooks.id, notebookEntries.notebookId)
        )
        .where(and(eq(notebooks.userId, user.id), eq(notebooks.id, input.id)));

      const selectableEntries = entries
        .filter((entry) => entry.notebookEntry.valueType === "array")
        .map((entry) => entry.notebookEntry.id);
        if (selectableEntries.length === 0) {
          return { entries, select: [] };
        }
      const select = await ctx.db
        .select()
        .from(notebookEntries)
        .innerJoin(
          notebookEntryValueArraies,
          eq(notebookEntries.id, notebookEntryValueArraies.notebookEntryId)
        )
        .where(inArray(notebookEntries.id, selectableEntries));
      return { entries, select };
    }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        entries: z.array(
          z.object({
            label: z.string(),
            valueType: z.enum(["string", "number", "boolean", "array"]),
            array: z.array(z.string()),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let notebookId = null;
      await ctx.db.transaction(async (tx) => {
        const notebookRes = await tx
          .insert(notebooks)
          .values([
            {
              title: input.title,
              userId: ctx.session.user.id,
            },
          ])
          .returning();
        notebookId = notebookRes[0]?.id ?? 0;

        for (const entry of input.entries) {
          const notebookEntryRes = await tx
            .insert(notebookEntries)
            .values({
              label: entry.label,
              notebookId: notebookId,
              valueType: entry.valueType,
            })
            .returning();
          if (entry.valueType === "array") {
            await tx.insert(notebookEntryValueArraies).values(
              entry.array.map((x) => {
                return {
                  notebookEntryId: notebookEntryRes[0]?.id ?? 0,
                  value: x,
                };
              })
            );
          }
        }
      });
      return {
        notebookId,
      };
    }),
});
