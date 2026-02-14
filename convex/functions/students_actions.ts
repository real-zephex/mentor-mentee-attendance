import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import { Students } from "../types";
import { requireAuth } from "./helper";

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

    // Delete associated attendance records first to prevent orphaned data
    const attendanceRecords = await ctx.db
      .query("attendance")
      .withIndex("by_student", (q) => q.eq("student", args.student_id))
      .collect();

    for (const record of attendanceRecords) {
      await ctx.db.delete("attendance", record._id);
    }

    // Now safe to delete the student
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
