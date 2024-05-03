import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  notebookEntries,
  notebookEntryValueArraies,
  notebooks,
  pageEntries,
  pages,
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
  getInfo: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.session.user;
      const notebookRes = await ctx.db
        .select()
        .from(notebooks)
        .where(and(eq(notebooks.userId, user.id), eq(notebooks.id, input.id)));
      const notebook = notebookRes.length > 0 ? notebookRes[0] : null;
      return { notebook };
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
            array: z.array(
              z.object({
                value: z.string(),
              })
            ),
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
                  value: x.value,
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
  update: protectedProcedure
    .input(
      z.object({
        notebookId: z.number(),
        title: z.string(),
        entries: z.array(
          z.object({
            notebookEntryId: z.number().optional(),
            label: z.string(),
            valueType: z.enum(["string", "number", "boolean", "array"]),
            array: z.array(
              z.object({
                notebookEntryValueArrayId: z.number().optional(),
                value: z.string(),
              })
            ),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let status = 500;
      await ctx.db.transaction(async (tx) => {
        const res = await tx
          .select()
          .from(notebooks)
          .where(
            and(
              eq(notebooks.id, input.notebookId),
              eq(notebooks.userId, ctx.session.user.id)
            )
          );
        if (res.length === 0) {
          status = 404;
          return;
        }
        await tx
          .update(notebooks)
          .set({ title: input.title })
          .where(
            and(
              eq(notebooks.id, input.notebookId),
              eq(notebooks.userId, ctx.session.user.id)
            )
          );
        // idが存在する->update、idが存在しない->insert
        for (const entry of input.entries) {
          if (entry.notebookEntryId) {
            await tx
              .update(notebookEntries)
              .set({
                label: entry.label,
                valueType: entry.valueType,
              })
              .where(eq(notebookEntries.id, entry.notebookEntryId));
            if (entry.valueType === "array") {
              for (const ary of entry.array) {
                if (ary.notebookEntryValueArrayId) {
                  await tx
                    .update(notebookEntryValueArraies)
                    .set({
                      value: ary.value,
                    })
                    .where(
                      and(
                        eq(
                          notebookEntryValueArraies.id,
                          ary.notebookEntryValueArrayId
                        ),
                        eq(
                          notebookEntryValueArraies.notebookEntryId,
                          entry.notebookEntryId
                        )
                      )
                    );
                } else {
                  await tx.insert(notebookEntryValueArraies).values({
                    notebookEntryId: entry.notebookEntryId,
                    value: ary.value,
                  });
                }
              }
            }
          } else {
            const notebookEntryRes = await tx
              .insert(notebookEntries)
              .values({
                notebookId: input.notebookId,
                valueType: entry.valueType,
                label: entry.label,
              })
              .returning();
            const notebookEntryId = notebookEntryRes[0]?.id ?? 0;
            if (entry.valueType === "array") {
              for (const ary of entry.array) {
                await tx.insert(notebookEntryValueArraies).values({
                  notebookEntryId,
                  value: ary.value,
                });
              }
            }
          }
        }
        // 削除する項目
        status = 200;
      });
      return { status };
    }),
  deleteOne: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const notebookId = input.id;
      let status = 500;
      await ctx.db.transaction(async (tx) => {
        const data = await tx
          .select({
            id: notebooks.id,
          })
          .from(notebooks)
          .where(
            and(
              eq(notebooks.userId, ctx.session.user.id),
              eq(notebooks.id, notebookId)
            )
          );
        if (!data || data.length === 0) {
          status = 404;
          return;
        }
        const notebookEnties = await tx
          .select({
            notebookEntryId: notebookEntries.id,
            notebookEntryValueArrayId: notebookEntryValueArraies.id,
            pageId: pages.id,
            pageEntryId: pageEntries.id,
          })
          .from(notebookEntries)
          .leftJoin(
            notebookEntryValueArraies,
            eq(notebookEntries.id, notebookEntryValueArraies.notebookEntryId)
          )
          .leftJoin(pages, eq(notebookEntries.notebookId, pages.notebookId))
          .leftJoin(
            pageEntries,
            eq(notebookEntries.id, pageEntries.notebookEntryId)
          )
          .where(eq(notebookEntries.notebookId, notebookId));
        const notebookEntryIds = unique(
          notebookEnties.map((x) => x.notebookEntryId)
        );
        const notebookEntryValueArrayIds = unique(
          notebookEnties
            .filter((x) => x.notebookEntryValueArrayId !== null)
            .map((x) => x.notebookEntryValueArrayId!)
        );
        const pageIds = unique(
          notebookEnties.filter((x) => x.pageId !== null).map((x) => x.pageId!)
        );
        const pageEntryIds = unique(
          notebookEnties
            .filter((x) => x.pageEntryId !== null)
            .map((x) => x.pageEntryId!)
        );
        if (pageEntryIds.length > 0) {
          await tx
            .delete(pageEntries)
            .where(inArray(pageEntries.id, pageEntryIds));
        }
        if (pageIds.length > 0) {
          await tx.delete(pages).where(inArray(pages.id, pageIds));
        }
        if (notebookEntryValueArrayIds.length > 0) {
          await tx
            .delete(notebookEntryValueArraies)
            .where(
              inArray(notebookEntryValueArraies.id, notebookEntryValueArrayIds)
            );
        }
        if (notebookEntryIds.length > 0) {
          await tx
            .delete(notebookEntries)
            .where(inArray(notebookEntries.id, notebookEntryIds));
        }
        await tx.delete(notebooks).where(eq(notebooks.id, notebookId));
        status = 200;
      });
      return { status };
    }),
});

const unique = (ary: number[]): number[] => {
  return Array.from(new Set(ary));
};
