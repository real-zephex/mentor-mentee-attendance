"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendanceCell } from "@/components/custom/AttendanceCell";
import { AppShell } from "@/components/custom/AppShell";
import { Id } from "@/convex/_generated/dataModel";

type AttendanceMetric = {
  id: string;
  totalPresent: number;
  totalAbsent: number;
};

export default function OverviewPage() {
  const overviewData = useQuery(api.functions.queries.getAttendanceOverview);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    let mounted = true;

    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/api/auth-status", { method: "GET" });
        const data = await response.json();
        if (mounted) {
          setIsAuthenticated(Boolean(data.authenticated));
        }
      } catch {
        if (mounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setAuthChecked(true);
        }
      }
    };

    checkAuthStatus();

    return () => {
      mounted = false;
    };
  }, []);

  const transformed = useMemo(() => {
    if (!overviewData) {
      return null;
    }

    const { students, sessions, attendance } = overviewData;

    const attendanceMap: Record<string, Record<string, (typeof attendance)[0]>> = {};
    attendance.forEach((record) => {
      if (!attendanceMap[record.class_session_id]) {
        attendanceMap[record.class_session_id] = {};
      }
      attendanceMap[record.class_session_id][record.student_id] = record;
    });

    const attendanceMetrics: AttendanceMetric[] = students.map((student) => {
      const totalPresent = attendance.filter(
        (record) => record.student_id === student._id && record.status === "Present",
      ).length;
      const totalAbsent = attendance.filter(
        (record) => record.student_id === student._id && record.status === "Absent",
      ).length;
      return {
        id: student._id,
        totalPresent,
        totalAbsent,
      };
    });

    const filteredStudents = students
      .filter((student) => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) {
          return true;
        }

        return (
          student.name.toLowerCase().includes(term) ||
          student.roll_number.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => Number(a.roll_number) - Number(b.roll_number));

    return {
      students: filteredStudents,
      sessions,
      attendanceMap,
      attendanceMetrics,
      totalStudents: students.length,
      totalSessions: sessions.length,
    };
  }, [overviewData, searchTerm]);

  if (overviewData === undefined) {
    return (
      <AppShell
        title="Attendance Overview"
        description="Consolidated attendance records across sessions."
      >
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppShell>
    );
  }

  if (!transformed) {
    return null;
  }

  const { students, sessions, attendanceMap, attendanceMetrics, totalStudents, totalSessions } =
    transformed;

  return (
    <AppShell
      title="Attendance Overview"
      description="Search, review, and audit attendance across all sessions."
      showLogout={isAuthenticated}
    >
      <div className="mb-4 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Students</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{totalStudents}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Sessions</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{totalSessions}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Search Students</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by name or roll number"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </CardContent>
        </Card>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">
        {!authChecked
          ? "Checking access level..."
          : isAuthenticated
            ? "Edit mode enabled: you can update attendance from this table."
            : "Read-only mode: sign in to edit attendance."}
      </p>

      <div className="hidden rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-20 w-48 border-r bg-background font-bold">
                Student Name
              </TableHead>
              {sessions.map((session) => (
                <TableHead
                  key={session._id}
                  className="min-w-24 border-r text-center font-semibold"
                >
                  <div className="text-xs uppercase text-muted-foreground">
                    {session.session_date}
                  </div>
                  <div className="text-sm font-bold">{session.start_time}</div>
                </TableHead>
              ))}
              <TableHead className="sticky right-0 z-20 w-28 border-r bg-background text-center font-bold">
                Attendance
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const attendanceOfStudent = attendanceMetrics.find((metric) => metric.id === student._id);
              const attendancePercentage =
                attendanceOfStudent && totalSessions > 0
                  ? (attendanceOfStudent.totalPresent / totalSessions) * 100
                  : 0;

              return (
                <TableRow key={student._id}>
                  <TableCell className="sticky left-0 z-10 border-r bg-background font-medium">
                    <div className="font-semibold">{student.name}</div>
                    <div className="text-xs text-muted-foreground">{student.roll_number}</div>
                  </TableCell>
                  {sessions.map((session) => {
                    const record = attendanceMap[session._id]?.[student._id];
                    const isFutureSession = session.session_date > today;
                    return (
                      <TableCell key={session._id} className="border-r p-0 text-center">
                        <AttendanceCell
                          attendanceId={record?._id as Id<"attendance">}
                          studentId={student._id}
                          classSessionId={session._id}
                          initialStatus={record?.status}
                          isFutureSession={isFutureSession}
                          isReadOnly={!isAuthenticated}
                        />
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    <p
                      className={`text-center text-sm font-semibold ${attendancePercentage < 75 ? "text-red-600" : "text-lime-600"}`}
                    >
                      {attendancePercentage.toFixed()}%
                    </p>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {students.map((student) => {
          const attendanceOfStudent = attendanceMetrics.find((metric) => metric.id === student._id);
          const attendancePercentage =
            attendanceOfStudent && totalSessions > 0
              ? (attendanceOfStudent.totalPresent / totalSessions) * 100
              : 0;

          return (
            <Card key={student._id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{student.name}</CardTitle>
                <p className="text-sm text-muted-foreground">Roll: {student.roll_number}</p>
              </CardHeader>
              <CardContent>
                <p className={`text-sm font-semibold ${attendancePercentage < 75 ? "text-red-600" : "text-lime-600"}`}>
                  Attendance: {attendancePercentage.toFixed()}%
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {students.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">No matching students found.</p>
      ) : null}
    </AppShell>
  );
}
