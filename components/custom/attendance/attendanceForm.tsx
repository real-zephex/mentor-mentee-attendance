"use client";

import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { useMemo, useState } from "react";
import { useAttendanceBySession } from "@/hooks/useAttendanceData";
import { useStudentsByClass } from "@/hooks/useStudentData";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Check, Loader2, X } from "lucide-react";

const GetBadge = (status: "A" | "P" | "UM" | "DL") => {
  switch (status) {
    case "A":
      return (
        <Badge variant="destructive" className="text-xs font-semibold">
          Absent
        </Badge>
      );
    case "P":
      return (
        <Badge
          variant="outline"
          className="text-xs font-semibold bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400"
        >
          Present
        </Badge>
      );
    case "UM":
      return (
        <Badge variant="secondary" className="text-xs font-semibold">
          Unmarked
        </Badge>
      );
    case "DL":
      return (
        <Badge
          variant="outline"
          className="text-xs font-semibold bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400"
        >
          DL
        </Badge>
      );
  }
};

const AttendanceForm = ({
  sessionId,
  classId,
}: {
  sessionId: Id<"sessions">;
  classId: Id<"classes">;
}) => {
  const {
    data: attendance,
    isLoading: attendanceLoading,
    error: attendanceError,
  } = useAttendanceBySession(sessionId);
  const {
    data: students,
    isLoading: studentsLoading,
    error: studentsError,
  } = useStudentsByClass(classId);

  const patchAttendance = useMutation(
    api.functions.attendance_actions.patchAttendance,
  );

  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const stats = useMemo(() => {
    if (!attendance) return { present: 0, total: 0 };
    return {
      present: attendance.filter((a) => a.status === "P").length,
      total: attendance.length,
    };
  }, [attendance]);

  const isAllPresent = useMemo(() => {
    return (
      attendance &&
      attendance.length > 0 &&
      attendance.every((a) => a.status === "P")
    );
  }, [attendance]);

  const handleMarkAllPresent = async (checked: boolean) => {
    if (!checked || !attendance) return;

    setIsBulkUpdating(true);
    const toUpdate = attendance.filter((a) => a.status !== "P");

    try {
      const promise = Promise.all(
        toUpdate.map((a) => patchAttendance({ id: a._id, status: "P" })),
      );

      toast.promise(promise, {
        loading: "Marking everyone as present...",
        success: "All students marked as present.",
        error: "Failed to mark some students.",
      });

      await promise;
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // id -> name, roll
  const studentsMap = useMemo(() => {
    if (!students) return {};
    const tempMap: Record<
      string,
      { student_name: string; student_roll: string }
    > = {};
    for (const student of students) {
      tempMap[student._id] = {
        student_name: student.name,
        student_roll: student.roll_no,
      };
    }
    return tempMap;
  }, [students]);

  const handleAttendanceChange = async (
    id: Id<"attendance">,
    status: "DL" | "A" | "P" | "UM",
  ) => {
    try {
      await patchAttendance({ id, status });
      toast.info(`Updated attendance to ${status}.`);
    } catch (error) {
      console.error("Error while patching attendance: ", error);
      toast.error("Faced an error while marking attendance");
    }
  };

  if (attendanceLoading || studentsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Loading attendance records...</p>
      </div>
    );
  }

  if (attendanceError || studentsError) {
    return (
      <div className="text-center py-12 text-destructive bg-destructive/10 rounded-lg border border-destructive/20 m-4">
        <p className="font-semibold">Failed to load attendance</p>
        <p className="text-sm">{attendanceError || studentsError}</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="w-full h-full lg:h-[80dvh] overflow-y-auto rounded-md border border-border">
        <div className="flex flex-row items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10 py-3 px-4 border-b">
          <div className="flex items-center gap-3">
            <Checkbox
              id="mark-all-present"
              checked={isAllPresent}
              onCheckedChange={handleMarkAllPresent}
              disabled={isBulkUpdating}
            />
            <Label
              htmlFor="mark-all-present"
              className="text-sm font-medium cursor-pointer select-none"
            >
              Mark all present
            </Label>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="text-muted-foreground">Attendance:</span>
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
              {stats.present} / {stats.total} Present
            </span>
          </div>
        </div>
        <Table>
          <TableCaption className="pb-4">
            Attendance records for this session.
          </TableCaption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold w-24">Roll No</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold w-56">Actions</TableHead>
              <TableHead className="font-semibold w-32">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendance.map((attendanceRecord) => {
              const studentId = attendanceRecord.student as string;
              const studentData = studentsMap[studentId];

              // Skip if student not found in map
              if (!studentData) return null;

              const isPresent = attendanceRecord.status === "P";
              const isAbsent = attendanceRecord.status === "A";

              return (
                <TableRow key={attendanceRecord._id} className="text-sm">
                  <TableCell className="font-mono text-xs">
                    {studentData.student_roll}
                  </TableCell>
                  <TableCell className="font-medium">
                    {studentData.student_name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon-xs"
                            variant={isPresent ? "default" : "outline"}
                            className={
                              isPresent
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "text-emerald-600 border-emerald-600/20 hover:bg-emerald-50"
                            }
                            onClick={() =>
                              handleAttendanceChange(attendanceRecord._id, "P")
                            }
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Mark Present</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon-xs"
                            variant={isAbsent ? "destructive" : "outline"}
                            className={
                              !isAbsent
                                ? "text-destructive border-destructive/20 hover:bg-destructive/5"
                                : ""
                            }
                            onClick={() =>
                              handleAttendanceChange(attendanceRecord._id, "A")
                            }
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Mark Absent</TooltipContent>
                      </Tooltip>

                      <Select
                        value={attendanceRecord.status}
                        onValueChange={(e: "DL" | "A" | "P" | "UM") =>
                          handleAttendanceChange(attendanceRecord._id, e)
                        }
                      >
                        <SelectTrigger
                          className="text-xs h-8 flex-1"
                          aria-label={`Mark status for ${studentData.student_name}`}
                        >
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="P" className="text-xs">
                              Present
                            </SelectItem>
                            <SelectItem value="A" className="text-xs">
                              Absent
                            </SelectItem>
                            <SelectItem value="DL" className="text-xs">
                              DL
                            </SelectItem>
                            <SelectItem value="UM" className="text-xs">
                              Unmarked
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                  <TableCell>{GetBadge(attendanceRecord.status)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};

export default AttendanceForm;
