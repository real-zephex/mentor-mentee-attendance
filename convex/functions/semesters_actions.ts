import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { ReturnProps, Semester } from "../types";
import { requireAdminAuth } from "./helper";

export const addNewSemester = mutation({
  args: Semester,
  handler: async (ctx, args): Promise<ReturnProps<Id<"semesters">>> => {
    try {
      await requireAdminAuth(ctx);
      const newSemesterId = await ctx.db.insert("semesters", args);
      return { status: "success", data: newSemesterId };
    } catch (error) {
      console.error("Failed to create semester:", error);
      return {
        status: "error",
        error:
          error instanceof ConvexError
            ? error.message
            : (error as Error).message,
      };
    }
  },
});

export const deleteSemester = mutation({
  args: { sem_id: v.id("semesters") },
  handler: async (ctx, args): Promise<ReturnProps<null>> => {
    try {
      await requireAdminAuth(ctx);
      await ctx.db.delete("semesters", args.sem_id);
      return { status: "success", data: null };
    } catch (error) {
      console.error("Failed to delete semester:", error);
      return {
        status: "error",
        error:
          error instanceof ConvexError
            ? error.message
            : (error as Error).message,
      };
    }
  },
});

export const patchSemester = mutation({
  args: v.object({
    id: v.id("semesters"),
    data: Semester,
  }),
  handler: async (ctx, args): Promise<ReturnProps<null>> => {
    try {
      await requireAdminAuth(ctx);
      await ctx.db.patch("semesters", args.id, args.data);
      return { status: "success", data: null };
    } catch (error) {
      console.error("Failed to update semester:", error);
      return {
        status: "error",
        error:
          error instanceof ConvexError
            ? error.message
            : (error as Error).message,
      };
    }
  },
});
