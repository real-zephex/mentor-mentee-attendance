import { query } from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import { ReturnProps } from "../types";
import { ConvexError, v } from "convex/values";
import { requireAuth } from "./helper";

export type ReturnType = Doc<"attendance">;
export type StudentsData = Doc<"students">;
export type SessionsData = Doc<"sessions">;
export type SubjectsData = Doc<"subjects">;

export const GetAttendanceBySession = query({
  args: { session: v.id("sessions") },
  handler: async (ctx, args): Promise<ReturnProps<ReturnType[]>> => {
    try {
      await requireAuth(ctx);
      const attendance = await ctx.db
        .query("attendance")
        .filter((q) => q.eq(q.field("session"), args.session))
        .collect();

      return {
        status: "success",
        data: attendance,
      };
    } catch (error) {
      console.error(`Error while fetching attendance for session: ${error} `);
      return {
        status: "error",
        error: (error as Error).message,
      };
    }
  },
});

type AttendanceMatrix = {
  students: StudentsData[];
  sessions: SessionsData[];
  subjects: SubjectsData[];
  attendance_matrix: AttendanceMap;
};

type AttendanceMap = Record<string, "A" | "P" | "DL" | "UM" | null>;

export const GetAttendanceMatrix = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, args): Promise<ReturnProps<AttendanceMatrix>> => {
    await requireAuth(ctx);
    try {
      const students = await ctx.db
        .query("students")
        .withIndex("by_class", (q) => q.eq("class", args.classId))
        .collect();
      const sessions = await ctx.db
        .query("sessions")
        .withIndex("by_class", (q) => q.eq("class", args.classId))
        .collect();

      if (sessions.length === 0 || students.length === 0)
        throw new ConvexError(
          "Length of sessions or students cannot be 0. Please verfiy the query and check status in database",
        );

      const subjectIds = Array.from(
        new Set(sessions.map((session) => session.subject)),
      );
      const subjectDocs = await Promise.all(
        subjectIds.map((subjectId) => ctx.db.get(subjectId)),
      );
      const subjects = subjectDocs.filter(
        (subject): subject is SubjectsData => subject !== null,
      );

      //  fetch attendance for sessions in this class
      const sessionIds = sessions.map((s) => s._id);
      const attendancePromises = sessionIds.map((sessionId) =>
        ctx.db
          .query("attendance")
          .filter((q) => q.eq(q.field("session"), sessionId))
          .collect(),
      );
      const attendanceArrays = await Promise.all(attendancePromises);
      const attendance = attendanceArrays.flat();

      const attendanceMap: AttendanceMap = {};
      for (const record of attendance) {
        const key = `${record.student}_${record.session}`;
        attendanceMap[key] = record.status;
      }

      return {
        status: "success",
        data: {
          students,
          sessions,
          subjects,
          attendance_matrix: attendanceMap,
        },
      };
    } catch (error) {
      console.error(
        "Error occured while constructing attendance matrix: ",
        error,
      );
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
