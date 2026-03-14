import { ConvexError, v } from "convex/values";
import { query } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import { ReturnProps } from "../types";
import { requireAuth } from "./helper";

export type MarksType = Doc<"marks">;

export const GetAllMarks = query({
  handler: async (ctx): Promise<ReturnProps<MarksType[]>> => {
    try {
      await requireAuth(ctx);
      const marks = await ctx.db.query("marks").collect();
      return {
        status: "success",
        data: marks,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConvexError ? error.message : (error as Error).message;
      return {
        status: "error",
        error: errorMessage,
      };
    }
  },
});

export const GetSubjectMarks = query({
  args: { subject_id: v.id("subjects") },
  handler: async (ctx, args): Promise<ReturnProps<MarksType[]>> => {
    try {
      await requireAuth(ctx);
      const marks = await ctx.db
        .query("marks")
        .withIndex("by_subject", (q) => q.eq("subject", args.subject_id))
        .collect();
      return {
        status: "success",
        data: marks,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConvexError ? error.message : (error as Error).message;
      return {
        status: "error",
        error: errorMessage,
      };
    }
  },
});

export const GetMarksByFilters = query({
  args: {
    subject_id: v.optional(v.id("subjects")),
    exam_id: v.optional(v.id("exams")),
    semester_id: v.optional(v.id("semesters")),
    class_id: v.optional(v.id("classes")),
  },
  handler: async (ctx, args): Promise<ReturnProps<MarksType[]>> => {
    try {
      await requireAuth(ctx);
      let marks: MarksType[] = [];

      if (args.class_id) {
        marks = await ctx.db
          .query("marks")
          .withIndex("by_class", (q) => q.eq("class", args.class_id!))
          .collect();
      } else if (args.subject_id) {
        marks = await ctx.db
          .query("marks")
          .withIndex("by_subject", (q) => q.eq("subject", args.subject_id!))
          .collect();
      } else if (args.exam_id) {
        marks = await ctx.db
          .query("marks")
          .withIndex("by_exam", (q) => q.eq("exam", args.exam_id!))
          .collect();
      } else if (args.semester_id) {
        marks = await ctx.db
          .query("marks")
          .withIndex("by_semester", (q) => q.eq("semester", args.semester_id!))
          .collect();
      } else {
        marks = await ctx.db.query("marks").collect();
      }

      // Post-query filtering for combined filters
      if (args.class_id && (args.subject_id || args.exam_id || args.semester_id)) {
        if (args.subject_id) marks = marks.filter((m) => m.subject === args.subject_id);
        if (args.exam_id) marks = marks.filter((m) => m.exam === args.exam_id);
        if (args.semester_id) marks = marks.filter((m) => m.semester === args.semester_id);
      } else {
        if (args.exam_id && args.subject_id) {
          marks = marks.filter((m) => m.exam === args.exam_id);
        }
        if (args.semester_id && (args.subject_id || args.exam_id)) {
          marks = marks.filter((m) => m.semester === args.semester_id);
        }
      }

      return {
        status: "success",
        data: marks,
      };
    } catch (error) {
      const errorMessage =
        error instanceof ConvexError ? error.message : (error as Error).message;
      return {
        status: "error",
        error: errorMessage,
      };
    }
  },
});

