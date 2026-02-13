import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import { Students } from "../types";
import { requireAdminAuth, requireAuth } from "./helper";

export const newStudents = mutation({
  args: Students,
  handler: async (ctx, args) => {
    try {
      await requireAuth(ctx);
      const existing = await ctx.db
        .query("students")
        .withIndex("by_roll", (q) => q.eq("roll_no", args.roll_no))
        .unique();
      if (existing) {
        throw new ConvexError("Student with this roll already exists");
      }

      const result = await ctx.db.insert("students", args);
      return result;
    } catch (error) {
      console.error("Failed to insert student", error);

      if (error instanceof ConvexError) {
        throw error;
      }

      throw new ConvexError("Failed to create student");
    }
  },
});

export const deleteStudent = mutation({
  args: { student_id: v.id("students") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    await ctx.db.delete("students", args.student_id);
  },
});

export const patchStudents = mutation({
  args: {
    id: v.id("students"),
    data: Students,
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    await ctx.db.patch("students", args.id, args.data);
  },
});
