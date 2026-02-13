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
    try {
      await requireAuth(ctx);
      const newClass = await ctx.db.insert("sessions", args);

      const getStudents = await ctx.db
        .query("students")
        .withIndex("by_class", (q) => q.eq("class", args.class))
        .collect();

      const attendanceMap = getStudents.map((i) => {
        return {
          status: "UM" as const,
          session: newClass,
          student: i._id,
        };
      });
      await BatchAttendance(ctx, attendanceMap);

      return newClass;
    } catch (error) {
      console.error(`Failed to insert new session: ${error}`);
      throw new ConvexError((error as Error).message);
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
