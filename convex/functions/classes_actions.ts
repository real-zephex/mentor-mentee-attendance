import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import { ClassesTable } from "../types";
import { requireAdminAuth } from "./helper";
import { Doc } from "../_generated/dataModel";

export type ReturnType = Doc<"classes">;

export const newClass = mutation({
  args: ClassesTable,
  handler: async (ctx, args) => {
    try {
      await requireAdminAuth(ctx);
      const newClass = await ctx.db.insert("classes", args);
      return newClass;
    } catch (error) {
      console.error(`Failed to insert new class: ${error}`);

      if (error instanceof ConvexError) {
        throw error;
      }

      throw new ConvexError((error as Error).message);
    }
  },
});

export const deleteClass = mutation({
  args: { class_id: v.id("classes") },
  handler: async (ctx, args) => {
    await requireAdminAuth(ctx);

    // Cascade delete: Remove all related data to prevent orphaned records
    // 1. Get all students and sessions for this class
    const students = await ctx.db
      .query("students")
      .withIndex("by_class", (q) => q.eq("class", args.class_id))
      .collect();

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_class", (q) => q.eq("class", args.class_id))
      .collect();

    // 2. Delete all attendance records for these students
    for (const student of students) {
      const attendanceRecords = await ctx.db
        .query("attendance")
        .withIndex("by_student", (q) => q.eq("student", student._id))
        .collect();

      for (const record of attendanceRecords) {
        await ctx.db.delete("attendance", record._id);
      }
    }

    // 3. Delete all sessions
    for (const session of sessions) {
      await ctx.db.delete("sessions", session._id);
    }

    // 4. Delete all students
    for (const student of students) {
      await ctx.db.delete("students", student._id);
    }

    // 5. Finally delete the class itself
    await ctx.db.delete("classes", args.class_id);
  },
});

export const patchClass = mutation({
  args: { id: v.id("classes"), data: ClassesTable },
  handler: async (ctx, args) => {
    await requireAdminAuth(ctx);
    await ctx.db.patch("classes", args.id, args.data);
  },
});
