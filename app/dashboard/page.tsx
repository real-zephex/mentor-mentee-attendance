"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NewStudent from "@/components/custom/studentForm";
import NewSessionForm from "@/components/custom/sessionForm";
import NewAttendanceForm from "@/components/custom/attendanceForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableAttendanceMatrix } from "@/components/custom/EditableAttendanceMatrix";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function DashboardPage() {
  const overviewData = useQuery(api.functions.queries.getAttendanceOverview);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8 text-center">Mentor-Mentee Dashboard</h1>
      <Tabs defaultValue="attendance" className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="students">Add Students</TabsTrigger>
          <TabsTrigger value="sessions">New Session</TabsTrigger>
          <TabsTrigger value="attendance">Mark Attendance</TabsTrigger>
          <TabsTrigger value="edit-attendance">Edit Attendance</TabsTrigger>
        </TabsList>
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Student Registration</CardTitle>
              <CardDescription>Add new student records to the system.</CardDescription>
            </CardHeader>
            <CardContent>
              <NewStudent />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>Create new sessions for attendance tracking.</CardDescription>
            </CardHeader>
            <CardContent>
              <NewSessionForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Daily Attendance</CardTitle>
              <CardDescription>Mark attendance for students for today&apos;s sessions.</CardDescription>
            </CardHeader>
            <CardContent>
              <NewAttendanceForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="edit-attendance">
          <Card>
            <CardHeader>
              <CardTitle>Edit Attendance Matrix</CardTitle>
              <CardDescription>View and edit attendance records for all students and sessions.</CardDescription>
            </CardHeader>
            <CardContent>
              {overviewData === undefined ? (
                <div className="space-y-4">
                  <p className="text-center text-muted-foreground">Loading attendance data...</p>
                </div>
              ) : (
                <EditableAttendanceMatrix
                  students={overviewData.students}
                  sessions={overviewData.sessions}
                  attendance={overviewData.attendance}
                  isLoading={false}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
