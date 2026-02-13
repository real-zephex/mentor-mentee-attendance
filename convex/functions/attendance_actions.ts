import { ConvexError } from "convex/values";
import { MutationCtx } from "../_generated/server";
import { Attendance } from "../types";
import { requireAuth } from "./helper";
import { Doc } from "../_generated/dataModel";

export type ReturnType = Doc<"attendance">;

export const BatchAttendance = async (ctx: MutationCtx, data: Attendance[]) => {
  await requireAuth(ctx);
  const opsRequired = data.length;
  try {
    const ids: string[] = [];
    for (const i of data) {
      const id = await ctx.db.insert("attendance", i);
      ids.push(id);
    }
    if (opsRequired != ids.length)
      return new ConvexError("Missing entries detected!");
  } catch (error) {
    console.error("error while adding attendance: ", error);
    if (error instanceof ConvexError) throw error;
    return new ConvexError((error as Error).message);
  }
};
