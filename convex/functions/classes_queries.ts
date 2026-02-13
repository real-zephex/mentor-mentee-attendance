import { query } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import { requireAuth } from "./helper";
import { ReturnProps } from "../types";

export type ReturnType = Doc<"classes">;

export const GetAllClasses = query({
  handler: async (ctx): Promise<ReturnProps<ReturnType[]>> => {
    try {
      await requireAuth(ctx);
      const data = await ctx.db.query("classes").withIndex("by_year").collect();
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
