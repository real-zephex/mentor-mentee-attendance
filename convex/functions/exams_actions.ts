import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import { Exams } from "../types";
import { requireAdminAuth } from "./helper";

export const AddNewExam = mutation({
  args: Exams,
  handler: async (ctx, args) => {
    try {
      await requireAdminAuth(ctx);
      const newExam = await ctx.db.insert("exams", args);
      return newExam;
    } catch (error) {
      console.error("Error while creating new exam:", error);
      throw new Error(
        error instanceof ConvexError
          ? error.message
          : (error as Error).message,
      );
    }
  },
});

export const patchExam = mutation({
  args: {
    exam_id: v.id("exams"),
    data: Exams,
  },
  handler: async (ctx, args) => {
    try {
      await requireAdminAuth(ctx);
      await ctx.db.patch("exams", args.exam_id, args.data);
    } catch (error) {
      console.error("Error while patching exam with id:", args.exam_id, error);
      throw new Error(
        error instanceof ConvexError
          ? error.message
          : (error as Error).message,
      );
    }
  },
});

export const deleteExam = mutation({
  args: {
    exam_id: v.id("exams"),
  },
  handler: async (ctx, args) => {
    try {
      await requireAdminAuth(ctx);
      await ctx.db.delete("exams", args.exam_id);
    } catch (error) {
      console.error("Error deleting exam:", error);
      throw new Error(
        error instanceof ConvexError
          ? error.message
          : (error as Error).message,
      );
    }
  },
});
