import { mutation } from "../_generated/server";
import { attendanceObject, sessionObject, studentsObject } from "../types";
import { v } from "convex/values";

type AddStudentsProps = {
  status: boolean;
  id: string | null;
  message: string;
};
export const addStudents = mutation({
  args: studentsObject,
  handler: async (ctx, args): Promise<AddStudentsProps> => {
    try {
      const existingEntry = await ctx.db
        .query("students")
        .withIndex("by_roll", (q) => q.eq("roll_number", args.roll_number))
        .first();
      if (existingEntry) {
        return {
          status: false,
          id: null,
          message: "Student already exists",
        };
      }

      const newEntryId = await ctx.db.insert("students", args);
      return {
        status: true,
        id: newEntryId,
        message: "Student added successfully",
      };
    } catch (error) {
      console.error(`Error in Student Management: ${error}`);
      return {
        status: false,
        id: null,
        message: "An error occurred while adding the student",
      };
    }
  },
});

export const addSessions = mutation({
  args: sessionObject,
  handler: async (ctx, args): Promise<AddStudentsProps> => {
    try {
      const newItemId = await ctx.db.insert("sessions", args);
      return {
        status: true,
        id: newItemId,
        message: "Session added successfully",
      };
    } catch (error) {
      console.error(`Error in Session Management: ${error}`);
      return {
        status: false,
        id: null,
        message: "An error occurred while adding the session",
      };
    }
  },
});

export const addAttendance = mutation({
  args: attendanceObject,
  handler: async (ctx, args): Promise<AddStudentsProps> => {
    try {
      const newItemId = await ctx.db.insert("attendance", args);
      return {
        status: true,
        id: newItemId,
        message: "Attendance added successfully",
      };
    } catch (error) {
      console.error(`Error in Attendance Management: ${error}`);
      return {
        status: false,
        id: null,
        message: "An error occurred while adding the attendance",
      };
    }
  },
});

export const removeStudent = mutation({
  args: { id: v.id("students") },
  handler: async (ctx, args) => {
    try {
      const studentAttendance = await ctx.db
        .query("attendance")
        .withIndex("by_student", (q) => q.eq("student_id", args.id))
        .collect();

      for (const attendanceRecord of studentAttendance) {
        await ctx.db.delete("attendance", attendanceRecord._id);
      }

      const removeId = await ctx.db.delete("students", args.id);

      return {
        status: true,
        id: removeId,
        message: "Student removed successfully",
      };
    } catch (error) {
      console.error(`Error in Student Management: ${error}`);
      return {
        status: false,
        id: null,
        message: "An error occurred while removing the student",
      };
    }
  },
});
