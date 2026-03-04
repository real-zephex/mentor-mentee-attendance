import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, TableProperties } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="rounded-2xl border bg-background px-6 py-10 text-center shadow-sm">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Mentor-Mentee Attendance</h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Operational dashboard for session planning and attendance execution.
          </p>
          <div className="mt-5">
            <Link href="/login">
              <Button size="lg">Sign in to continue</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-fit rounded-full bg-primary/10 p-3">
                <LayoutDashboard className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Management Dashboard</CardTitle>
              <CardDescription>
                Run attendance workflows, manage sessions, and update student records.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="w-48">Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-fit rounded-full bg-primary/10 p-3">
                <TableProperties className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Attendance Overview</CardTitle>
              <CardDescription>
                Review consolidated attendance and quickly find students at risk.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link href="/overview">
                <Button size="lg" variant="outline" className="w-48">View Records</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
