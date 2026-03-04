"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface AttendanceCellProps {
  attendanceId?: Id<"attendance">;
  studentId: string;
  classSessionId: string;
  initialStatus?: string;
  isFutureSession: boolean;
  isReadOnly?: boolean;
}

export function AttendanceCell({
  attendanceId,
  studentId,
  classSessionId,
  initialStatus,
  isFutureSession,
  isReadOnly = false,
}: AttendanceCellProps) {
  const [status, setStatus] = useState<string | undefined>(initialStatus);
  const [isLoading, setIsLoading] = useState(false);
  const updateAttendance = useMutation(api.functions.mutations.updateAttendance);
  const bulkUpdate = useMutation(api.functions.mutations.bulkUpdateAttendance);

  const handleUpdate = async (newStatus: string) => {
    if (newStatus === status) return;
    if (isFutureSession) {
      toast.error("Cannot edit attendance for future sessions");
      return;
    }

    setIsLoading(true);
    try {
      if (attendanceId) {
        const result = await updateAttendance({
          id: attendanceId,
          status: newStatus,
        });
        if (result.status) {
          setStatus(newStatus);
          toast.success("Attendance updated");
        } else {
          toast.error(result.message);
        }
      } else {
        // If record doesn't exist yet, create it
        const result = await bulkUpdate({
          updates: [
            {
              student_id: studentId,
              class_session_id: classSessionId,
              status: newStatus,
            },
          ],
        });
        if (result.status) {
          setStatus(newStatus);
          toast.success("Attendance marked");
        } else {
          toast.error(result.message);
        }
      }
    } catch (error) {
      toast.error("Failed to update attendance");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Render read-only badge when isReadOnly is true
  if (isReadOnly) {
    return (
      <div className="w-full h-full min-h-10 flex items-center justify-center">
        {status === "Present" ? (
          <Badge className="bg-green-500">P</Badge>
        ) : status === "Absent" ? (
          <Badge variant="destructive">A</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none w-full h-full min-h-10 flex items-center justify-center">
        {status === "Present" ? (
          <Badge className="bg-green-500 hover:bg-green-600 cursor-pointer">
            P
          </Badge>
        ) : status === "Absent" ? (
          <Badge variant="destructive" className="cursor-pointer">
            A
          </Badge>
        ) : (
          <span className="text-muted-foreground cursor-pointer hover:text-foreground">
            -
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuItem onClick={() => handleUpdate("Present")}>
          Mark Present
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleUpdate("Absent")}>
          Mark Absent
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
