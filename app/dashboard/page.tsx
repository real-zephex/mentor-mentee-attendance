"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/custom/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, ClipboardCheck, Users } from "lucide-react";

export default function DashboardPage() {
  const data = useQuery(api.functions.queries.getAttendanceOverview);

  const metrics = useMemo(() => {
    if (!data) {
      return null;
    }

    const today = new Date().toISOString().split("T")[0];
    const todaySessions = data.sessions.filter((session) => session.session_date === today);
    return {
      students: data.students.length,
      sessions: data.sessions.length,
      todaySessions: todaySessions.length,
      attendanceRecords: data.attendance.length,
    };
  }, [data]);

  return (
    <AppShell
      title="Mentor-Mentee Dashboard"
      description="Daily operations hub for attendance management."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Students</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {metrics ? metrics.students : "…"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Sessions</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {metrics ? metrics.sessions : "…"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Today&apos;s Sessions</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {metrics ? metrics.todaySessions : "…"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Attendance Rows</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {metrics ? metrics.attendanceRecords : "…"}
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="border-primary/20">
          <CardHeader className="space-y-3">
            <div className="inline-flex w-fit rounded-md bg-primary/10 p-2 text-primary">
              <ClipboardCheck size={18} />
            </div>
            <CardTitle className="text-lg">Mark Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/attendance">
              <Button className="w-full">Go to Attendance</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-3">
            <div className="inline-flex w-fit rounded-md bg-primary/10 p-2 text-primary">
              <Users size={18} />
            </div>
            <CardTitle className="text-lg">Manage Students</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/students">
              <Button variant="outline" className="w-full">
                Open Students
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-3">
            <div className="inline-flex w-fit rounded-md bg-primary/10 p-2 text-primary">
              <CalendarDays size={18} />
            </div>
            <CardTitle className="text-lg">Manage Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/sessions">
              <Button variant="outline" className="w-full">
                Open Sessions
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
