import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import { Marks } from "../types";
import { requireAuth } from "./helper";

export const BatchMarksInsert = mutation({
  args: { data: v.array(Marks) },
  handler: async (ctx, args) => {
    try {
      const caller = await requireAuth(ctx);

      // If the caller is a teacher, ensure all subjects belong to them
      if (caller.role === "teacher") {
        const teacherSubjects = await ctx.db
          .query("subjects")
          .withIndex("by_teacher", (q) => q.eq("teacher", caller._id))
          .collect();
        const teacherSubjectIds = new Set(teacherSubjects.map((s) => s._id));

        for (const item of args.data) {
          if (!teacherSubjectIds.has(item.subject)) {
            throw new ConvexError("Unauthorized: You can only add marks for your own subjects");
          }
        }
      }

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
      const caller = await requireAuth(ctx);

      const existing = await ctx.db.get(args.marks_id);
      if (!existing) throw new ConvexError("Mark record not found");

      // If the caller is a teacher, ensure the mark belongs to one of their subjects
      if (caller.role === "teacher") {
        const subject = await ctx.db
          .query("subjects")
          .withIndex("by_teacher", (q) => q.eq("teacher", caller._id))
          .filter((q) => q.eq(q.field("_id"), existing.subject))
          .first();

        if (!subject) {
          throw new ConvexError("Unauthorized: You can only edit marks for your own subjects");
        }
      }

      await ctx.db.patch(args.marks_id, { marks: args.marks });
    } catch (error) {
      throw new Error(
        error instanceof ConvexError ? error.message : (error as Error).message,
      );
    }
  },
});
