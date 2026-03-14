import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import { Marks } from "../types";
import { requireAuth } from "./helper";

export const BatchMarksInsert = mutation({
  args: { data: v.array(Marks) },
  handler: async (ctx, args) => {
    try {
      await requireAuth(ctx);
      const ids: string[] = [];
      for (const item of args.data) {
        const existing = await ctx.db
          .query("marks")
          .withIndex("by_student_subject_exam", (q) =>
            q
              .eq("student", item.student)
              .eq("subject", item.subject)
              .eq("exam", item.exam),
          )
          .unique();
        if (existing)
          throw new Error(
            `Marks already found for: Student: \n${item.student} | Exam: ${item.exam} | Marks: ${existing.marks}`,
          );
        const newItem = await ctx.db.insert("marks", item);
        ids.push(newItem);
      }
      return ids;
    } catch (error) {
      throw new Error(
        error instanceof ConvexError ? error.message : (error as Error).message,
      );
    }
  },
});

export const patchMarks = mutation({
  args: { marks_id: v.id("marks"), marks: v.number() },
  handler: async (ctx, args) => {
    try {
      await requireAuth(ctx);
      await ctx.db.patch("marks", args.marks_id, {marks: args.marks});
    } catch (error) {
      throw new Error((error as Error).message);
    }
  },
});
