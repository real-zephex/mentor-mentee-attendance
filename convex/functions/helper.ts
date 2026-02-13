import { MutationCtx, QueryCtx } from "../_generated/server";
import { createUser, patchUser, deleteUser } from "./users_actions";
import { getCurrentUser } from "./users_queries";

// Get current session from clerk and fetch user info from convex since they sync up together
async function getCaller(ctx: MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const result = await ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", (q) =>
      q.eq("clerk_user_id", identity.subject),
    )
    .first();

  if (!result) return null;

  if (result.status == "active") {
    return result;
  } else {
    return null;
  }
}

async function requireAuth(ctx: MutationCtx | QueryCtx) {
  const caller = await getCaller(ctx);
  if (!caller) {
    throw new Error("Unauthorized: Authentication Required");
  }
  return caller;
}

async function requireAdminAuth(ctx: MutationCtx | QueryCtx) {
  const user = await requireAuth(ctx);
  if (user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return user;
}

export {
  requireAuth,
  requireAdminAuth,
  createUser,
  deleteUser,
  patchUser,
  getCurrentUser,
};
