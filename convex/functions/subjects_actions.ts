import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import { Subjects } from "../types";
import { requireAdminAuth } from "./helper";

export const newSubject = mutation({
  args: Subjects,
  handler: async (ctx, args) => {
    await requireAdminAuth(ctx);

    const existing = await ctx.db
      .query("subjects")
      .withIndex("by_code", (q) => q.eq("subject_code", args.subject_code))
      .unique();

    if (existing) {
      throw new ConvexError("Subject code already exists");
    }

    return await ctx.db.insert("subjects", args);
  },
});

export const patchSubject = mutation({
  args: { id: v.id("subjects"), data: Subjects },
  handler: async (ctx, args) => {
    await requireAdminAuth(ctx);

    const existing = await ctx.db
      .query("subjects")
      .withIndex("by_code", (q) => q.eq("subject_code", args.data.subject_code))
      .unique();

    if (existing && existing._id !== args.id) {
      throw new ConvexError("Subject code already exists");
    }

    await ctx.db.patch("subjects", args.id, args.data);
  },
});

export const deleteSubject = mutation({
  args: { subject_id: v.id("subjects") },
  handler: async (ctx, args) => {
    await requireAdminAuth(ctx);
    await ctx.db.delete("subjects", args.subject_id);
  },
});
