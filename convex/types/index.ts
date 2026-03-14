import { v, Infer } from "convex/values";

export const UserObject = v.object({
  clerk_user_id: v.string(),
  role: v.union(
    v.literal("user"),
    v.literal("admin"),
    v.literal("student"),
    v.literal("teacher"),
  ),
  email: v.string(),
  status: v.union(v.literal("active"), v.literal("pending")),
  name: v.string(),
  student: v.optional(v.id("students")),
});
export type UserType = Infer<typeof UserObject>;

export const ClassesTable = v.object({
  class_name: v.string(),
  class_year: v.string(),
  room: v.string(),
});

export const Students = v.object({
  roll_no: v.string(),
  name: v.string(),
  class: v.id("classes"),
});
export type StudentType = Infer<typeof Students>;

export const Sessions = v.object({
  class: v.id("classes"),
  session_date: v.string(),
  start_time: v.string(),
  end_time: v.string(),
  remarks: v.string(),
  name: v.string(),
  subject: v.id("subjects"),
  created_by: v.id("users"),
});

export const Attendance = v.object({
  session: v.id("sessions"),
  student: v.id("students"),
  status: v.union(
    v.literal("A"),
    v.literal("P"),
    v.literal("DL"),
    v.literal("UM"),
  ),
});
export type Attendance = Infer<typeof Attendance>;

export const Subjects = v.object({
  subject_name: v.string(),
  subject_code: v.string(),
  teacher: v.id("users"),
  semester: v.id("semesters"),
});
export type Subjects = Infer<typeof Subjects>;

// MARK: We have SEM
export const Semester = v.object({
  number: v.number(),
  academic_year: v.string(),
});
export type Semester = Infer<typeof Semester>;

export const Marks = v.object({
  student: v.id("students"),
  subject: v.id("subjects"),
  semester: v.id("semesters"),
  marks: v.number(),
  exam: v.id("exams"),
  class: v.id("classes")
});
export type Marks = Infer<typeof Marks>;

// MARK: We are here
export const Exams = v.object({
  name: v.string(),
  semester: v.id("semesters"),
  max_marks: v.number()
});
export type Exams = Infer<typeof Exams>;

// Function Return Types
type Success<T> = {
  status: "success";
  data: T;
};

type Failure = {
  status: "error";
  error: string;
};

export type ReturnProps<T> = Success<T> | Failure;
