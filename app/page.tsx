"use client";

import ManageClasses from "@/components/custom/classes/classesTable";
import StudentTable from "@/components/custom/students/studentsTable";
import SessionsTable from "@/components/custom/sessions/sessionsTable";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardOverview } from "@/components/custom/dashboardOverview";
import { UserCircle, BookOpen, Calendar, Flag } from "lucide-react";
import AttendanceTable from "@/components/custom/attendance/attendanceTable";

const Homepage = () => {
  return (
    <main className="container mx-auto py-6 px-4 space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your classes and track student attendance.
        </p>
      </div>

      <DashboardOverview />

      <Tabs defaultValue="students" className="w-full space-y-6">
        <div className="flex items-center justify-between border-b pb-1 overflow-x-auto">
          <TabsList className="bg-transparent h-auto p-0 gap-6">
            <TabsTrigger
              value="students"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-sky-500 data-[state=active]:text-sky-500 data-[state=active]:shadow-none"
            >
              <div className="flex items-center gap-2">
                <UserCircle className="size-4" />
                Students
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="classes"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-sky-500 data-[state=active]:text-sky-500 data-[state=active]:shadow-none"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="size-4" />
                Classes
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="sessions"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-sky-500 data-[state=active]:text-sky-500 data-[state=active]:shadow-none"
            >
              <div className="flex items-center gap-2">
                <Calendar className="size-4" />
                Sessions
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="attendance"
              className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-sky-500 data-[state=active]:text-sky-500 data-[state=active]:shadow-none"
            >
              <div className="flex items-center gap-2">
                <Flag className="size-4" />
                Attendance
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="students"
          className="mt-0 border-none p-0 outline-none"
        >
          <StudentTable />
        </TabsContent>
        <TabsContent
          value="classes"
          className="mt-0 border-none p-0 outline-none"
        >
          <ManageClasses />
        </TabsContent>
        <TabsContent
          value="sessions"
          className="mt-0 border-none p-0 outline-none"
        >
          <SessionsTable />
        </TabsContent>
        <TabsContent
          value="attendance"
          className="mt-0 border-none p-0 outline-none"
        >
          <AttendanceTable />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Homepage;
