import { query } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import { requireAuth } from "./helper";
import { ReturnProps } from "../types";

export const GetAllExams = query({
  handler: async (ctx): Promise<ReturnProps<Doc<"exams">[]>> => {
    try {
      await requireAuth(ctx);
      const exams = await ctx.db.query("exams").collect();
      return {
        status: "success",
        data: exams,
      };
    } catch (error) {
      console.error("Error while fetching exams:", error);
      return {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
