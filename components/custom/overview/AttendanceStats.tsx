"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, XCircle, Users } from "lucide-react";

interface AttendanceStatsProps {
  stats: {
    goodCount: number;
    fairCount: number;
    poorCount: number;
    totalStudents: number;
    avgAttendance: number;
  };
}

export function AttendanceStats({ stats }: AttendanceStatsProps) {
  const goodPercentage = stats.totalStudents ? (stats.goodCount / stats.totalStudents) * 100 : 0;
  const fairPercentage = stats.totalStudents ? (stats.fairCount / stats.totalStudents) * 100 : 0;
  const poorPercentage = stats.totalStudents ? (stats.poorCount / stats.totalStudents) * 100 : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card className="border-none shadow-sm bg-emerald-500/5">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-emerald-600">
            Good Attendance
          </CardTitle>
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-700">{stats.goodCount}</div>
          <p className="text-xs text-emerald-600/70 mt-1">
            {stats.goodCount > 0 ? "> 75% attendance" : "No students yet"}
          </p>
          <Progress value={goodPercentage} className="h-1 mt-3 bg-emerald-200" />
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-amber-500/5">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-amber-600">
            Fair Attendance
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-700">{stats.fairCount}</div>
          <p className="text-xs text-amber-600/70 mt-1">
            50% - 75% attendance
          </p>
          <Progress value={fairPercentage} className="h-1 mt-3 bg-amber-200" />
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-rose-500/5">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-rose-600">
            Poor Attendance
          </CardTitle>
          <XCircle className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-700">{stats.poorCount}</div>
          <p className="text-xs text-rose-600/70 mt-1">
            {"< 50% attendance"}
          </p>
          <Progress value={poorPercentage} className="h-1 mt-3 bg-rose-200" />
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-sky-500/5">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-sky-600">
            Class Average
          </CardTitle>
          <Users className="h-4 w-4 text-sky-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-sky-700">
            {stats.avgAttendance.toFixed(1)}%
          </div>
          <p className="text-xs text-sky-600/70 mt-1">
            Across {stats.totalStudents} students
          </p>
          <Progress value={stats.avgAttendance} className="h-1 mt-3 bg-sky-200" />
        </CardContent>
      </Card>
    </div>
  );
}
