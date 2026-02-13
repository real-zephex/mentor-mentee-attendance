import { query } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import { requireAuth } from "./helper";
import { ReturnProps } from "../types";

export type ReturnType = Doc<"sessions">;

export const GetAllSessions = query({
  handler: async (ctx): Promise<ReturnProps<ReturnType[]>> => {
    try {
      await requireAuth(ctx);
      const data = await ctx.db
        .query("sessions")
        .withIndex("by_date")
        .collect();
      return {
        status: "success",
        data,
      };
    } catch (error) {
      console.error("Error occurred while fetching students", error);

      return {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
