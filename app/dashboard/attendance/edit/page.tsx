"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { EditableAttendanceMatrix } from "@/components/custom/EditableAttendanceMatrix";
import { AppShell } from "@/components/custom/AppShell";

export default function EditAttendancePage() {
  const overviewData = useQuery(api.functions.queries.getAttendanceOverview);

  return (
    <AppShell
      title="Edit Attendance Matrix"
      description="Update attendance records directly from the matrix view."
    >
      {overviewData === undefined ? (
        <div className="rounded-lg border bg-background p-6 text-center text-muted-foreground">
          Loading attendance data...
        </div>
      ) : (
        <EditableAttendanceMatrix
          students={overviewData.students}
          sessions={overviewData.sessions}
          attendance={overviewData.attendance}
          isLoading={false}
        />
      )}
    </AppShell>
  );
}
