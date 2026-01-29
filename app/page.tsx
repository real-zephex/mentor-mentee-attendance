import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, TableProperties } from "lucide-react";

export default function Home() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
            Mentor-Mentee System
          </h1>
          <p className="text-xl text-gray-600">
            Streamlined student management and attendance tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-4">
                <LayoutDashboard className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Management Dashboard</CardTitle>
              <CardDescription>
                Add students, create sessions, and mark daily attendance.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="w-48">Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
                <TableProperties className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Attendance Overview</CardTitle>
              <CardDescription>
                View consolidated attendance records for all students.
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
