"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MatrixCell } from "./MatrixCell";
import { AttendanceStats } from "./AttendanceStats";
import { AttendanceMatrixControls, SortType } from "./AttendanceMatrixControls";
import { format } from "date-fns";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AttendanceMatrixProps {
  classId: Id<"classes">;
  className: string;
  onBack: () => void;
}

export function AttendanceMatrix({
  classId,
  className,
  onBack,
}: AttendanceMatrixProps) {
  const [sortBy, setSortBy] = useState<SortType>("roll");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  const matrixResponse = useQuery(
    api.functions.attendance_queries.GetAttendanceMatrix,
    {
      classId,
    },
  );

  const isLoading = matrixResponse === undefined;
  const isError = matrixResponse?.status === "error";

  // Calculate sorted and filtered data
  const processedData = useMemo(() => {
    if (!matrixResponse || matrixResponse.status === "error") return null;

    const { students, sessions, attendance_matrix } = matrixResponse.data;

    // 1. Filter sessions by date range
    const filteredSessions = sessions.filter((session) => {
      const sessionDate = new Date(session.session_date);
      if (dateRange.from && sessionDate < dateRange.from) return false;
      if (dateRange.to && sessionDate > dateRange.to) return false;
      return true;
    });

    // 2. Calculate individual attendance percentages for the filtered sessions
    const studentAttendanceMap = new Map<Id<"students">, number>();

    students.forEach((student) => {
      let presentCount = 0;
      let totalCount = 0;

      filteredSessions.forEach((session) => {
        const key = `${student._id}_${session._id}`;
        const status = attendance_matrix[key];

        if (status === "P" || status === "DL") presentCount++;
        if (status) totalCount++; // Only count sessions that have a recorded status (P/A/DL)
      });

      const percentage = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;
      studentAttendanceMap.set(student._id, percentage);
    });

    // 3. Sort students
    const sortedStudents = [...students].sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "roll") {
        comparison = a.roll_no.localeCompare(b.roll_no);
      } else if (sortBy === "attendance%") {
        comparison =
          (studentAttendanceMap.get(a._id) || 0) -
          (studentAttendanceMap.get(b._id) || 0);
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    // 4. Calculate Stats
    const goodCount = Array.from(studentAttendanceMap.values()).filter(
      (v) => v >= 75,
    ).length;
    const fairCount = Array.from(studentAttendanceMap.values()).filter(
      (v) => v >= 50 && v < 75,
    ).length;
    const poorCount = Array.from(studentAttendanceMap.values()).filter(
      (v) => v < 50,
    ).length;
    const avgAttendance =
      Array.from(studentAttendanceMap.values()).reduce((a, b) => a + b, 0) /
      (students.length || 1);

    return {
      sortedStudents,
      filteredSessions,
      attendance_matrix,
      studentAttendanceMap,
      stats: {
        goodCount,
        fairCount,
        poorCount,
        totalStudents: students.length,
        avgAttendance,
      },
    };
  }, [matrixResponse, dateRange, sortBy, sortOrder]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !processedData) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <AlertCircle className="size-12 text-rose-500 mb-4 opacity-50" />
          <h3 className="text-lg font-semibold">Failed to load matrix</h3>
          <p className="text-muted-foreground mb-6 max-w-xs">
            {matrixResponse?.status === "error"
              ? matrixResponse.error
              : "Unknown error occurred"}
          </p>
          <Button onClick={onBack} variant="outline">
            Go back to classes
          </Button>
        </CardContent>
      </Card>
    );
  }

  const {
    sortedStudents,
    filteredSessions,
    attendance_matrix,
    studentAttendanceMap,
    stats,
  } = processedData;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full"
        >
          <ChevronLeft className="size-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{className}</h2>
          <p className="text-muted-foreground text-sm">
            Attendance Overview & Analytics
          </p>
        </div>
      </div>

      <AttendanceStats stats={stats} />

      <AttendanceMatrixControls
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onReset={() => {
          setSortBy("roll");
          setSortOrder("asc");
          setDateRange({});
        }}
      />

      <Card className="border-none shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
        <div className="relative overflow-x-auto overflow-y-auto max-h-150">
          <Table>
            <TableHeader className="sticky top-0 bg-background/95 backdrop-blur z-40 shadow-sm">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-25 font-bold bg-background/95 sticky left-0 top-0 z-50">
                  Roll No
                </TableHead>
                <TableHead className="w-50 font-bold bg-background/95 sticky left-25 top-0 z-50 border-r">
                  Student Name
                </TableHead>
                {filteredSessions.map((session) => (
                  <TableHead
                    key={session._id}
                    className="min-w-20 text-center p-2 sticky top-0 bg-background/95 z-40"
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                        {format(new Date(session.session_date), "MMM dd")}
                      </span>
                      <span
                        className="text-[11px] font-medium truncate max-w-32"
                        title={session.name}
                      >
                        {session.name}
                      </span>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-20 text-center font-bold bg-background/95 sticky right-0 top-0 z-50 border-l">
                  %
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStudents.map((student) => (
                <TableRow
                  key={student._id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-medium bg-background/80 backdrop-blur sticky left-0 z-10">
                    {student.roll_no}
                  </TableCell>
                  <TableCell className="font-medium bg-background/80 backdrop-blur sticky left-25 z-10 border-r truncate max-w-[200px]">
                    {student.name}
                  </TableCell>
                  {filteredSessions.map((session) => (
                    <TableCell key={session._id} className="p-2 text-center">
                      <MatrixCell
                        status={
                          attendance_matrix[`${student._id}_${session._id}`]
                        }
                      />
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold bg-background/80 backdrop-blur sticky right-0 z-10 border-l">
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        (studentAttendanceMap.get(student._id) || 0) >= 75
                          ? "text-emerald-600"
                          : (studentAttendanceMap.get(student._id) || 0) >= 50
                            ? "text-amber-600"
                            : "text-rose-600",
                      )}
                    >
                      {(studentAttendanceMap.get(student._id) || 0).toFixed(0)}%
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSessions.length === 0 && (
            <div className="flex flex-col items-center justify-center p-20 text-muted-foreground">
              <AlertCircle className="size-8 mb-2 opacity-20" />
              <p>No sessions found in the selected date range</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
