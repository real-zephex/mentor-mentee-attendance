"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarksType } from "@/convex/functions/marks_queries";
import { Doc } from "@/convex/_generated/dataModel";
import { GraduationCap, Percent, TrendingUp, Users } from "lucide-react";

interface StatsCardsProps {
  marks: MarksType[] | undefined;
  exams: Doc<"exams">[] | undefined;
}

export function StatsCards({ marks, exams }: StatsCardsProps) {
  if (!marks) return null;

  const totalEntries = marks.length;
  
  const avgAttendance = totalEntries > 0
    ? marks.reduce((acc, curr) => acc + curr.marks, 0) / totalEntries
    : 0;

  const highestScore = totalEntries > 0
    ? Math.max(...marks.map(m => m.marks))
    : 0;

  const passCount = marks.filter(m => {
    const exam = exams?.find(e => e._id === m.exam);
    if (!exam) return false;
    return (m.marks / exam.max_marks) * 100 >= 40;
  }).length;

  const passRate = totalEntries > 0 ? (passCount / totalEntries) * 100 : 0;

  const stats = [
    {
      title: "Total Entries",
      value: totalEntries,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Average Score",
      value: avgAttendance.toFixed(1),
      icon: TrendingUp,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Highest Score",
      value: highestScore,
      icon: GraduationCap,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Pass Rate",
      value: `${passRate.toFixed(1)}%`,
      icon: Percent,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`size-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
