"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, LayoutGrid } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendanceMatrix } from "./AttendanceMatrix";
import { Id } from "@/convex/_generated/dataModel";

export default function AttendanceOverview() {
  const [selectedClass, setSelectedClass] = useState<{ id: Id<"classes">; name: string } | null>(null);
  const classesResponse = useQuery(api.functions.classes_queries.GetAllClasses);

  const isLoading = classesResponse === undefined;

  if (selectedClass) {
    return (
      <AttendanceMatrix
        classId={selectedClass.id}
        className={selectedClass.name}
        onBack={() => setSelectedClass(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Attendance Analysis</h2>
        <p className="text-muted-foreground">
          Select a class to view its detailed attendance matrix and statistics.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : classesResponse.status === "success" && classesResponse.data.length > 0 ? (
          classesResponse.data.map((cls) => (
            <Card
              key={cls._id}
              className="group border-none shadow-sm hover:shadow-md transition-all cursor-pointer bg-card/50 backdrop-blur-sm overflow-hidden"
              onClick={() => setSelectedClass({ id: cls._id, name: cls.class_name })}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-sky-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600">
                    <BookOpen className="size-5" />
                  </div>
                  <Badge className="bg-sky-500/10 text-sky-600 border-none">
                    Year {cls.class_year}
                  </Badge>
                </div>
                <CardTitle className="text-xl mt-4 group-hover:text-sky-600 transition-colors">
                  {cls.class_name}
                </CardTitle>
                <CardDescription>Room: {cls.room}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="size-4" />
                    <span>View Matrix</span>
                  </div>
                  <ArrowRight className="size-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
                <Button className="w-full bg-sky-500/5 text-sky-600 hover:bg-sky-500 hover:text-white border-none shadow-none font-semibold">
                  Select Class
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground">No classes found. Please add a class first.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${className}`}>
      {children}
    </span>
  );
}
