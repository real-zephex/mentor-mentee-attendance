import NewAttendanceForm from "@/components/custom/attendanceForm";
import { AppShell } from "@/components/custom/AppShell";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AttendancePage() {
  return (
    <AppShell
      title="Mark Attendance"
      description="Choose a session and update attendance quickly."
      actions={
        <Link href="/dashboard/attendance/edit">
          <Button variant="outline" size="sm">Edit Matrix</Button>
        </Link>
      }
    >
      <NewAttendanceForm />
    </AppShell>
  );
}
