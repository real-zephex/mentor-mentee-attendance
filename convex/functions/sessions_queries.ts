import { query } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import { requireAuth } from "./helper";
import { ReturnProps } from "../types";
import { v } from "convex/values";

export type ReturnType = Doc<"sessions">;

export const GetAllSessions = query({
  handler: async (ctx): Promise<ReturnProps<ReturnType[]>> => {
    try {
      await requireAuth(ctx);
      const data = await ctx.db
        .query("sessions")
        .withIndex("by_date")
        .collect();
      return {
        status: "success",
        data,
      };
    } catch (error) {
      console.error("Error occurred while fetching students", error);

      return {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

export const GetTeacherSessions = query({
  args: { teacherId: v.id("users") },
  handler: async (ctx, args) => {
    try {
      await requireAuth(ctx);
      const data = await ctx.db
        .query("sessions")
        .withIndex("by_teacher", (q) => q.eq("created_by", args.teacherId))
        .collect();
      return {
        status: "success",
        data,
      };
    } catch (error) {
      console.error("Error occured while fetching students", error);
      
      return {
        status: "error",
        error: (error as Error).message
      }
    }
  },
});
