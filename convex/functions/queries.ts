import { query } from "../_generated/server";

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
      sessions: sessions.sort((a, b) => a.session_date.localeCompare(b.session_date)),
      attendance,
    };
  },
});


