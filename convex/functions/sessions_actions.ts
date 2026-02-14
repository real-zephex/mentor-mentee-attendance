import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import { Sessions } from "../types";
import { requireAuth } from "./helper";
import { Doc } from "../_generated/dataModel";
import { BatchAttendance } from "./attendance_actions";

export type ReturnType = Doc<"sessions">;

export const newSession = mutation({
  args: Sessions,
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    try {
      // Create the session first
      const newSessionId = await ctx.db.insert("sessions", args);

      // Get students for this class
      const students = await ctx.db
        .query("students")
        .withIndex("by_class", (q) => q.eq("class", args.class))
        .collect();

      // Validate that the class has students
      if (students.length === 0) {
        // Rollback: delete the session we just created
        await ctx.db.delete("sessions", newSessionId);
        throw new ConvexError(
          "Cannot create session: no students enrolled in this class",
        );
      }

      // Create default attendance records for all students
      const attendanceMap = students.map((student) => ({
        status: "UM" as const,
        session: newSessionId,
        student: student._id,
      }));

      await BatchAttendance(ctx, attendanceMap);

      return newSessionId;
    } catch (error) {
      console.error(`Failed to create session: ${error}`);
      throw error instanceof ConvexError
        ? error
        : new ConvexError((error as Error).message);
    }
  },
});

export const deleteSession = mutation({
  args: { session_id: v.id("sessions") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);

    // delete all attendance records associated with a session
    const attendanceRecords = await ctx.db
      .query("attendance")
      .withIndex("by_student")
      .filter((q) => q.eq(q.field("session"), args.session_id))
      .collect();

    for (const record of attendanceRecords) {
      await ctx.db.delete("attendance", record._id);
    }

    await ctx.db.delete("sessions", args.session_id);
  },
});

export const patchSessions = mutation({
  args: { id: v.id("sessions"), data: Sessions },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    await ctx.db.patch("sessions", args.id, args.data);
  },
});
