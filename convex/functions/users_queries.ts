import { query } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import {  requireAdminAuth } from "./helper";
import { ReturnProps } from "../types";

export type UserType = Doc<"users">;

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", (q) =>
        q.eq("clerk_user_id", identity.subject),
      )
      .first();

    return user || null;
  },
});

export const getAllUsers = query({
  handler: async (ctx): Promise<ReturnProps<UserType[]>> => {
    try {
      await requireAdminAuth(ctx);

      const users = await ctx.db.query("users").collect();

      return {
        status: "success",
        data: users,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
