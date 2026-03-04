"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendanceCell } from "@/components/custom/AttendanceCell";
import { Id } from "@/convex/_generated/dataModel";

type AttendanceMetric = {
  id: string;
  totalPresent: number;
  totalAbsent: number;
};

interface EditableAttendanceMatrixProps {
  students: any[];
  sessions: any[];
  attendance: any[];
  isLoading?: boolean;
}

export function EditableAttendanceMatrix({
  students,
  sessions,
  attendance,
  isLoading = false,
}: EditableAttendanceMatrixProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-100 w-full" />
      </div>
    );
  }

  const attendanceMetrics: AttendanceMetric[] = students.map((i) => {
    const totalPresent = attendance.filter(
      (j) => j.student_id === i._id && j.status === "Present",
    ).length;
    const totalAbsent = attendance.filter(
      (j) => j.student_id === i._id && j.status === "Absent",
    ).length;
    return {
      id: i._id,
      totalPresent: totalPresent,
      totalAbsent: totalAbsent,
    };
  });

  // Create a map for quick attendance lookup: session_id -> student_id -> record
  const attendanceMap: Record<string, Record<string, (typeof attendance)[0]>> =
    {};
  attendance.forEach((record) => {
    if (!attendanceMap[record.class_session_id]) {
      attendanceMap[record.class_session_id] = {};
    }
    attendanceMap[record.class_session_id][record.student_id] = record;
  });

  const today = new Date().toISOString().split("T")[0];
  const totalSessions = sessions.length;

  return (
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 z-20 bg-background border-r w-48 font-bold">
              Student Name
            </TableHead>
            {sessions.map((session) => (
              <TableHead
                key={session._id}
                className="text-center min-w-25 font-semibold border-r"
              >
                <div className="text-xs uppercase text-muted-foreground">
                  {session.session_date}
                </div>
                <div className="text-sm font-bold">{session.start_time}</div>
              </TableHead>
            ))}
            <TableHead className="sticky right-0 z-20 bg-background border-r w-32 font-bold text-center">
              Attendance
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students
            .sort(
              (a, b) =>
                parseInt(a.roll_number) - parseInt(b.roll_number),
            )
            .map((student) => {
              const attendanceOfStudent = attendanceMetrics.find(
                (i) => i.id === student._id,
              );
              const attendancePercentage = attendanceOfStudent
                ? (attendanceOfStudent.totalPresent / totalSessions) * 100
                : 0;

              return (
                <TableRow key={student._id}>
                  <TableCell className="sticky left-0 z-10 bg-background border-r font-medium">
                    <div className="font-semibold">{student.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {student.roll_number}
                    </div>
                  </TableCell>
                  {sessions.map((session) => {
                    const record =
                      attendanceMap[session._id]?.[student._id];
                    const isFutureSession = session.session_date > today;
                    return (
                      <TableCell
                        key={session._id}
                        className="text-center border-r p-0"
                      >
                        <AttendanceCell
                          attendanceId={record?._id as Id<"attendance">}
                          studentId={student._id}
                          classSessionId={session._id}
                          initialStatus={record?.status}
                          isFutureSession={isFutureSession}
                          isReadOnly={false}
                        />
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    <p
                      className={`text-center text-sm ${attendancePercentage < 75 ? "text-red-600" : "text-lime-500"} font-semibold`}
                    >
                      {attendancePercentage.toFixed()}%
                    </p>
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
      {students.length === 0 && (
        <p className="text-center py-8 text-muted-foreground">
          No students found.
        </p>
      )}
      {sessions.length === 0 && (
        <p className="text-center py-8 text-muted-foreground">
          No sessions found.
        </p>
      )}
    </div>
  );
}
