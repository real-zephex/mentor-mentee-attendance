import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import { ClassesTable } from "../types";
import { requireAdminAuth } from "./helper";
import { Doc } from "../_generated/dataModel";

export type ReturnType = Doc<"classes">;

export const newClass = mutation({
  args: ClassesTable,
  handler: async (ctx, args) => {
    try {
      await requireAdminAuth(ctx);
      const newClass = await ctx.db.insert("classes", args);
      return newClass;
    } catch (error) {
      console.error(`Failed to insert new class: ${error}`);

      if (error instanceof ConvexError) {
        throw error;
      }

      throw new ConvexError((error as Error).message);
    }
  },
});

export const deleteClass = mutation({
  args: { class_id: v.id("classes") },
  handler: async (ctx, args) => {
    await requireAdminAuth(ctx);
    await ctx.db.delete("classes", args.class_id);
  },
});

export const patchClass = mutation({
  args: { id: v.id("classes"), data: ClassesTable },
  handler: async (ctx, args) => {
    await requireAdminAuth(ctx);
    await ctx.db.patch("classes", args.id, args.data);
  },
});
