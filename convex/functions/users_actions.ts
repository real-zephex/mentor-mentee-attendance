import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import { UserObject } from "../types";
// import { requireAuth } from "./helper";

// this function is always called from webhook. No further imports or whatsoever
export const createUser = mutation({
  args: UserObject,
  handler: async (ctx, args) => {
    try {
      const result = await ctx.db.insert("users", args);
      return result;
    } catch (error) {
      console.error(`Failed to create new user: ${error}`);
      throw new ConvexError((error as Error).message);
    }
  },
});

export const deleteUser = mutation({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const id = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerk_user_id", args.clerkId))
      .first();
    if (!id) {
      throw new ConvexError("No entry for that user found in Convex Records");
    }
    await ctx.db.delete("users", id._id);
  },
});

export const patchUser = mutation({
  args: {
    clerk_user_id: v.string(),
    data: v.object({
      email: v.optional(v.string()),
      name: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerk_user_id", args.clerk_user_id),
      )
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch("users", user._id, args.data);
  },
});
