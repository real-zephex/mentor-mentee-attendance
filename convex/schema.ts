import { defineTable, defineSchema } from "convex/server";
import {
  Attendance,
  ClassesTable,
  Sessions,
  Students,
  Subjects,
  UserObject,
} from "./types";

export default defineSchema({
  users: defineTable(UserObject)
    .index("by_clerk_user_id", ["clerk_user_id"])
    .index("email", ["email"]),
  classes: defineTable(ClassesTable).index("by_year", ["class_year"]),
  students: defineTable(Students)
    .index("by_roll", ["roll_no"])
    .index("by_class", ["class"]),
  sessions: defineTable(Sessions)
    .index("by_date", ["session_date"])
    .index("by_class", ["class"]),
  attendance: defineTable(Attendance)
    .index("by_student", ["student"])
    .index("by_session", ["session", "student"]),
  subjects: defineTable(Subjects)
    .index("by_teacher", ["teacher"])
    .index("by_code", ["subject_code"]),
});
