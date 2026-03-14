import { defineTable, defineSchema } from "convex/server";
import {
  Attendance,
  ClassesTable,
  Exams,
  Marks,
  Semester,
  Sessions,
  Students,
  Subjects,
  UserObject,
} from "./types";

export default defineSchema({
  users: defineTable(UserObject)
    .index("by_clerk_user_id", ["clerk_user_id"])
    .index("email", ["email"])
    .index("by_role", ["role"])
    .index("by_status", ["status"]),
  classes: defineTable(ClassesTable)
    .index("by_year", ["class_year"])
    .index("by_name", ["class_name"]),
  students: defineTable(Students)
    .index("by_roll", ["roll_no"])
    .index("by_class", ["class"]),
  sessions: defineTable(Sessions)
    .index("by_date", ["session_date"])
    .index("by_class", ["class"])
    .index("by_teacher", ["created_by"])
    .index("by_subject", ["subject"]),
  attendance: defineTable(Attendance)
    .index("by_student", ["student"])
    .index("by_session", ["session", "student"]),
  subjects: defineTable(Subjects)
    .index("by_teacher", ["teacher"])
    .index("by_code", ["subject_code"])
    .index("by_semester", ["semester"])
    .index("by_semester_teacher", ["semester", "teacher"]),
  semesters: defineTable(Semester)
    .index("by_academic_year", ["academic_year"])
    .index("by_number", ["number"]),
  marks: defineTable(Marks)
    .index("by_student", ["student"])
    .index("by_subject", ["subject"])
    .index("by_semester", ["semester"])
    .index("by_exam", ["exam"])
    .index("by_class", ["class"])
    .index("by_student_subject", ["student", "subject"])
    .index("by_student_subject_exam", ["student", "subject", "exam"]),
  exams: defineTable(Exams).index("by_semester", ["semester"]),
});
