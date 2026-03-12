import { query } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import { ReturnProps } from "../types";
import { requireAdminAuth } from "./helper";

export type ReturnType = Doc<"subjects">;

export const GetAllSubjects = query({
  handler: async (ctx): Promise<ReturnProps<ReturnType[]>> => {
    try {
      await requireAdminAuth(ctx);
      const subjects = await ctx.db.query("subjects").collect();

      return {
        status: "success",
        data: subjects,
      };
    } catch (error) {
      console.error("Error occurred while fetching subjects", error);

      return {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});
