import { query } from "../_generated/server";
import { v } from "convex/values";

export const getStudents = query({
  handler: async ({ db }) => {
    const students = await db.query("students").collect();
    return { students, count: students.length };
  },
});

export const getSessions = query({
  handler: async ({ db }) => {
    const sessions = await db.query("sessions").collect();

    const date = new Date().toISOString().split("T")[0];
    const todaySessions = sessions.filter(
      (session) => session.session_date === date,
    );

    return { sessions, todaySessions, todaySessionCount: todaySessions.length };
  },
});

export const getAttendanceOverview = query({
  handler: async ({ db }) => {
    const students = await db.query("students").collect();
    const sessions = await db.query("sessions").collect();
    const attendance = await db.query("attendance").collect();

    return {
      students,
      sessions: sessions.sort((a, b) =>
        a.session_date.localeCompare(b.session_date),
      ),
      attendance,
    };
  },
});

export const getAttendanceBySession = query({
  args: { class_session_id: v.string() },
  handler: async ({ db }, args) => {
    const attendance = await db
      .query("attendance")
      .filter((q) => q.eq(q.field("class_session_id"), args.class_session_id))
      .collect();
    return attendance;
  },
});

export const getUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    try {
      const data = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();
      if (!data) {
        return {
          status: false,
          data: null,
        };
      }
      return {
        status: true,
        data,
      };
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error(
        "An error occured while getting entries from users table: ",
        errorMessage,
      );
      return {
        status: false,
        data: null,
      };
    }
  },
});
