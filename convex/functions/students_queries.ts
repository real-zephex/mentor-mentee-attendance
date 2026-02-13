import { query } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import { ReturnProps } from "../types";
import { v } from "convex/values";
import { requireAuth } from "./helper";

export type ReturnType = Doc<"students">;

export const getAllStudents = query({
  handler: async (ctx): Promise<ReturnProps<ReturnType[]>> => {
    try {
      await requireAuth(ctx);
      const students = await ctx.db
        .query("students")
        .withIndex("by_roll")
        .collect();
      return {
        status: "success",
        data: students,
      };
    } catch (error) {
      console.error(`Error while fetching students: ${error} `);
      return {
        status: "error",
        error: (error as Error).message,
      };
    }
  },
});

export const getAllStudentsByClass = query({
  args: { class: v.id("classes") },
  handler: async (ctx, args): Promise<ReturnProps<ReturnType[]>> => {
    try {
      await requireAuth(ctx);
      const classes = await ctx.db
        .query("students")
        .withIndex("by_class", (q) => q.eq("class", args.class))
        .collect();

      return {
        data: classes,
        status: "success",
      };
    } catch (error) {
      console.error(`Error fetching students for classs: ${error}. `);
      return {
        error: (error as Error).message,
        status: "error",
      };
    }
  },
});
