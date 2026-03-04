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
      const today = new Date().toISOString().split("T")[0];
      if (args.session_date > today) {
        return {
          status: false,
          id: null,
          message: "Cannot create sessions for future dates",
        };
      }
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
      const session = await ctx.db
        .query("sessions")
        .filter((q) => q.eq(q.field("session_id"), args.class_session_id))
        .first();

      if (session) {
        const today = new Date().toISOString().split("T")[0];
        if (session.session_date > today) {
          return {
            status: false,
            id: null,
            message: "Cannot mark attendance for future sessions",
          };
        }
      }

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

export const updateStudent = mutation({
  args: {
    id: v.id("students"),
    roll_number: v.string(),
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    dob: v.string(),
  },
  handler: async (ctx, args): Promise<AddStudentsProps> => {
    try {
      await ctx.db.patch(args.id, {
        roll_number: args.roll_number,
        name: args.name,
        phone: args.phone,
        email: args.email,
        dob: args.dob,
      });
      return {
        status: true,
        id: args.id,
        message: "Student updated successfully",
      };
    } catch (error) {
      console.error(`Error in Student Management: ${error}`);
      return {
        status: false,
        id: null,
        message: "An error occurred while updating the student",
      };
    }
  },
});

export const updateSession = mutation({
  args: {
    id: v.id("sessions"),
    session_id: v.string(),
    session_date: v.string(),
    start_time: v.string(),
    end_time: v.string(),
    remarks: v.string(),
  },
  handler: async (ctx, args): Promise<AddStudentsProps> => {
    try {
      // Prevent editing future sessions
      const today = new Date().toISOString().split("T")[0];
      if (args.session_date > today) {
        return {
          status: false,
          id: null,
          message: "Cannot set session date to the future",
        };
      }

      await ctx.db.patch(args.id, {
        session_id: args.session_id,
        session_date: args.session_date,
        start_time: args.start_time,
        end_time: args.end_time,
        remarks: args.remarks,
      });
      return {
        status: true,
        id: args.id,
        message: "Session updated successfully",
      };
    } catch (error) {
      console.error(`Error in Session Management: ${error}`);
      return {
        status: false,
        id: null,
        message: "An error occurred while updating the session",
      };
    }
  },
});

export const updateAttendance = mutation({
  args: {
    id: v.id("attendance"),
    status: v.string(),
  },
  handler: async (ctx, args): Promise<AddStudentsProps> => {
    try {
      // Check if session is in the future
      const attendance = await ctx.db.get(args.id);
      if (!attendance) {
        return { status: false, id: null, message: "Attendance record not found" };
      }
      
       const session = await ctx.db
         .query("sessions")
         .filter((q) => q.eq(q.field("_id"), attendance.class_session_id as string))
         .first();
      
      if (session) {
        const today = new Date().toISOString().split("T")[0];
        if (session.session_date > today) {
          return { status: false, id: null, message: "Cannot edit attendance for future sessions" };
        }
      }

      await ctx.db.patch(args.id, {
        status: args.status,
      });
      return {
        status: true,
        id: args.id,
        message: "Attendance updated successfully",
      };
    } catch (error) {
      console.error(`Error in Attendance Management: ${error}`);
      return {
        status: false,
        id: null,
        message: "An error occurred while updating the attendance",
      };
    }
  },
});

export const bulkUpdateAttendance = mutation({
  args: {
    updates: v.array(
      v.object({
        student_id: v.string(),
        class_session_id: v.string(),
        status: v.string(),
      })
    ),
  },
  handler: async (ctx, args): Promise<AddStudentsProps> => {
    try {
      let successCount = 0;
      for (const update of args.updates) {
        // Check if session is in the future
         const session = await ctx.db
           .query("sessions")
           .filter((q) => q.eq(q.field("_id"), update.class_session_id as string))
           .first();
        
        if (session) {
          const today = new Date().toISOString().split("T")[0];
          if (session.session_date > today) {
            continue; // Skip future sessions
          }
        }

        const existing = await ctx.db
          .query("attendance")
          .filter((q) =>
            q.and(
              q.eq(q.field("student_id"), update.student_id),
              q.eq(q.field("class_session_id"), update.class_session_id)
            )
          )
          .first();

        if (existing) {
          await ctx.db.patch(existing._id, { status: update.status });
        } else {
          await ctx.db.insert("attendance", {
            attendance_id: crypto.randomUUID(),
            ...update,
          });
        }
        successCount++;
      }
      return {
        status: true,
        id: null,
        message: `${successCount} attendance records updated successfully`,
      };
    } catch (error) {
      console.error(`Error in Bulk Attendance Management: ${error}`);
      return {
        status: false,
        id: null,
        message: "An error occurred during bulk attendance update",
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

export const removeSession = mutation({
  args: { id: v.id("sessions") },
  handler: async (ctx, args) => {
    try {
      const session = await ctx.db.get(args.id);
      if (!session) {
        return { status: false, id: null, message: "Session not found" };
      }

      // Delete all attendance records associated with this session
      const sessionAttendance = await ctx.db
        .query("attendance")
        .filter((q) => q.eq(q.field("class_session_id"), session.session_id))
        .collect();

      for (const attendanceRecord of sessionAttendance) {
        await ctx.db.delete(attendanceRecord._id);
      }

      // Delete the session itself
      const removeId = await ctx.db.delete(args.id);

      return {
        status: true,
        id: removeId,
        message: "Session and associated attendance removed successfully",
      };
    } catch (error) {
      console.error(`Error in Session Management: ${error}`);
      return {
        status: false,
        id: null,
        message: "An error occurred while removing the session",
      };
    }
  },
});
