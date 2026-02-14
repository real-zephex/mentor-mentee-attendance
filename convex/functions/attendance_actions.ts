import { ConvexError, v } from "convex/values";
import { mutation, MutationCtx } from "../_generated/server";
import { Attendance } from "../types";
import { requireAuth } from "./helper";
// import { Doc } from "../_generated/dataModel";

// export type ReturnType = Doc<"attendance">;

export const BatchAttendance = async (ctx: MutationCtx, data: Attendance[]) => {
  await requireAuth(ctx);
  try {
    for (const entry of data) {
      // Check if attendance already exists for this student and session
      const existing = await ctx.db
        .query("attendance")
        .filter((q) =>
          q.and(
            q.eq(q.field("session"), entry.session),
            q.eq(q.field("student"), entry.student),
          ),
        )
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, { status: entry.status });
      } else {
        await ctx.db.insert("attendance", entry);
      }
    }
    return { status: "success" };
  } catch (error) {
    console.error("error while adding/updating attendance: ", error);
    if (error instanceof ConvexError) throw error;
    return new ConvexError((error as Error).message);
  }
};

export const patchAttendance = mutation({
  args: {
    id: v.id("attendance"),
    status: v.union(
      v.literal("A"),
      v.literal("P"),
      v.literal("UM"),
      v.literal("DL"),
    ),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    await ctx.db.patch("attendance", args.id, { status: args.status });
  },
});
