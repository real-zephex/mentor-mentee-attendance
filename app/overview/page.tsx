"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function OverviewPage() {
  const overviewData = useQuery(api.functions.queries.getAttendanceOverview);

  if (overviewData === undefined) {
    return (
      <div className="container mx-auto py-10 space-y-4">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-100 w-full" />
      </div>
    );
  }

  const { students, sessions, attendance } = overviewData;

  // Create a map for quick attendance lookup: session_id -> student_id -> status
  const attendanceMap: Record<string, Record<string, string>> = {};
  attendance.forEach((record) => {
    if (!attendanceMap[record.class_session_id]) {
      attendanceMap[record.class_session_id] = {};
    }
    attendanceMap[record.class_session_id][record.student_id] = record.status;
  });

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Attendance Overview
          </CardTitle>
          <CardDescription className="text-center">
            Consolidated view of student attendance across all sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                      <div className="text-sm font-bold">
                        {session.start_time}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {students
                  .sort(
                    (a, b) => parseInt(a.roll_number) - parseInt(b.roll_number),
                  )
                  .map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="sticky left-0 z-10 bg-background border-r font-medium">
                        <div className="font-semibold">{student.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {student.roll_number}
                        </div>
                      </TableCell>
                      {sessions.map((session) => {
                        const status =
                          attendanceMap[session._id]?.[student._id];
                        return (
                          <TableCell
                            key={session._id}
                            className="text-center border-r"
                          >
                            {status === "Present" ? (
                              <Badge className="bg-green-500 hover:bg-green-600">
                                P
                              </Badge>
                            ) : status === "Absent" ? (
                              <Badge variant="destructive">A</Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
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
        </CardContent>
      </Card>
    </div>
  );
}
