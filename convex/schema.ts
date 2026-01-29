import { defineTable, defineSchema } from "convex/server";
import { studentsObject, sessionObject, attendanceObject } from "./types";

export default defineSchema({
  students: defineTable(studentsObject).index("by_roll", ["roll_number"]),
  sessions: defineTable(sessionObject).index("by_date", ["session_date"]),
  attendance: defineTable(attendanceObject).index("by_student", ["student_id"]),
});
