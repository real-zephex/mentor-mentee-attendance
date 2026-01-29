import { Infer, v } from "convex/values";

export const studentsObject = v.object({
  roll_number: v.string(),
  name: v.string(),
  phone: v.string(),
  email: v.string(),
  dob: v.string(),
});

export type studentObjectType = Infer<typeof studentsObject>;

export const sessionObject = v.object({
  session_id: v.string(),
  session_date: v.string(),
  start_time: v.string(),
  end_time: v.string(),
  remarks: v.string(),
});

export type sessionObjectType = Infer<typeof sessionObject>;

export const attendanceObject = v.object({
  attendance_id: v.string(),
  class_session_id: v.string(),
  student_id: v.string(),
  status: v.string(),
});

export type attendanceObjectType = Infer<typeof attendanceObject>;
