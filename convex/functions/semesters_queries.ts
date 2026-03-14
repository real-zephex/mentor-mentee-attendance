import { v } from "convex/values";
import { query } from "../_generated/server";
import { ReturnProps } from "../types";
import { requireAdminAuth, requireAuth } from "./helper";
import { Doc } from "../_generated/dataModel";

export const getAllSemesters = query({
  handler: async (ctx): Promise<ReturnProps<Doc<"semesters">[]>> => {
    try {
      await requireAuth(ctx);
      const semesters = await ctx.db.query("semesters").collect();
      const sorted = [...semesters].sort((a, b) => {
        if (a.academic_year === b.academic_year) {
          return a.number - b.number;
        }
        return a.academic_year.localeCompare(b.academic_year);
      });

      return {
        status: "success",
        data: sorted,
      };
    } catch (error) {
      console.error("Error occurred while fetching semesters", error);
      return {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

export const getSubjectsBySemester = query({
  args: { sem_id: v.id("semesters"), teach_id: v.id("users") },
  handler: async (ctx, args): Promise<ReturnProps<Doc<"subjects">[]>> => {
    try {
      await requireAuth(ctx);
      const subjects = await ctx.db
        .query("subjects")
        .withIndex("by_semester_teacher", (q) =>
          q.eq("semester", args.sem_id).eq("teacher", args.teach_id),
        )
        .collect();

      return {
        status: "success",
        data: subjects,
      };
    } catch (error) {
      console.error("Error occurred while fetching semester subjects", error);
      return {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
