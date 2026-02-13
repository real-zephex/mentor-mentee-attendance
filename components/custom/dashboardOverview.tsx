"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Users, BookOpen, Calendar, CheckCircle2 } from "lucide-react";

export function DashboardOverview() {
  const students = useQuery(api.functions.students_queries.getAllStudents);
  const classes = useQuery(api.functions.classes_queries.GetAllClasses);
  const sessions = useQuery(api.functions.sessions_queries.GetAllSessions);

  const studentsCount = students?.status === "success" ? students.data.length : 0;
  const classesCount = classes?.status === "success" ? classes.data.length : 0;
  const sessionsCount = sessions?.status === "success" ? sessions.data.length : 0;
  
  const todaySessionsCount = sessions?.status === "success" 
    ? sessions.data.filter((s) => {
        const today = new Date().toISOString().split('T')[0];
        return s.session_date === today;
      }).length 
    : 0;

  const stats = [
    {
      title: "Total Students",
      value: studentsCount,
      icon: Users,
      description: "Registered students",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Active Classes",
      value: classesCount,
      icon: BookOpen,
      description: "Across all years",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Total Sessions",
      value: sessionsCount,
      icon: Calendar,
      description: "Conducted sessions",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Active Today",
      value: todaySessionsCount,
      icon: CheckCircle2,
      description: "Sessions scheduled today",
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students === undefined || classes === undefined || sessions === undefined ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                stat.value
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
