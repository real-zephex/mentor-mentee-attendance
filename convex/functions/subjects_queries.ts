import { query } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import { ReturnProps } from "../types";
import { requireAdminAuth, requireAuth } from "./helper";
import { v } from "convex/values";

export type ReturnType = Doc<"subjects">;

export const GetAllSubjects = query({
  handler: async (ctx): Promise<ReturnProps<ReturnType[]>> => {
    try {
      await requireAdminAuth(ctx);
      const subjects = await ctx.db.query("subjects").collect();

      return {
        status: "success",
        data: subjects,
      };
    } catch (error) {
      console.error("Error occurred while fetching subjects", error);

      return {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

export const GetTeacherSubjects = query({
  args: { teacherId: v.id("users") },
  handler: async (ctx, args): Promise<ReturnProps<ReturnType[]>> => {
    try {
      await requireAuth(ctx);
      const subjects = await ctx.db
        .query("subjects")
        .withIndex("by_teacher", (q) => q.eq("teacher", args.teacherId))
        .collect();

      return {
        status: "success",
        data: subjects,
      };
    } catch (error) {
      console.error(
        `Error occurred while fetching subjects for teacher ${args.teacherId}`,
        error,
      );

      return {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

export const GetSubject = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args): Promise<ReturnProps<ReturnType>> => {
    try {
      await requireAuth(ctx);
      const subject = await ctx.db.get(args.subjectId);

      if (!subject) {
        return {
          status: "error",
          error: "Subject not found",
        };
      }

      return {
        status: "success",
        data: subject,
      };
    } catch (error) {
      console.error("Error occurred while fetching subject", error);

      return {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
