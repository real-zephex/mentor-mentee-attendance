"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Calendar,
  Clock,
  Search,
  Flag,
  CheckCircle2,
  Users,
  LayoutGrid,
} from "lucide-react";

// ui imports
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { to12Hour } from "../sessions/sessionsTable";
import AttendanceForm from "./attendanceForm";

const AttendanceTable = () => {
  const sessions = useQuery(api.functions.sessions_queries.GetAllSessions);
  const classes = useQuery(api.functions.classes_queries.GetAllClasses);

  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  const classMap = useMemo(() => {
    if (!classes || classes?.status === "error") return {};
    const tempMap: Record<string, string> = {};
    for (const i of classes.data) {
      tempMap[i._id] = i.class_name;
    }
    return tempMap;
  }, [classes]);

  const filteredSessions = useMemo(() => {
    if (!sessions || sessions.status === "error") return [];

    const today = new Date().toISOString().split("T")[0];

    const result = sessions.data.filter((session) => {
      const matchesSearch = session.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesClass =
        classFilter === "all" || session.class === classFilter;

      let matchesDate = true;
      if (dateFilter === "today") {
        matchesDate = session.session_date === today;
      } else if (dateFilter === "yesterday") {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        matchesDate = session.session_date === yesterdayStr;
      } else if (dateFilter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const sessionDate = new Date(session.session_date);
        matchesDate = sessionDate >= weekAgo;
      }

      return matchesSearch && matchesClass && matchesDate;
    });

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === "date-desc") {
        const dateDiff =
          new Date(b.session_date).getTime() -
          new Date(a.session_date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return b.start_time.localeCompare(a.start_time);
      }
      if (sortBy === "date-asc") {
        const dateDiff =
          new Date(a.session_date).getTime() -
          new Date(b.session_date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return a.start_time.localeCompare(b.start_time);
      }
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [sessions, searchQuery, classFilter, dateFilter, sortBy]);

  if (sessions === undefined || classes === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(() => {
          const time = new Date().toString();
          return (
            <Card key={time} className="border-none shadow-sm animate-pulse">
              <CardHeader className="h-32 bg-muted/50 rounded-t-lg" />
              <CardContent className="p-6 space-y-4">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-4 w-1/2 bg-muted rounded" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Flag className="size-6 text-sky-500" />
              Attendance Management
            </CardTitle>
            <CardDescription>
              Select a session to record or review student attendance
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background/50 border-muted"
              />
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-background/50 border-muted">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {Object.entries(classMap).map(([id, name]) => (
                  <SelectItem key={id} value={id}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-40 bg-background/50 border-muted">
                <SelectValue placeholder="All Dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40 bg-background/50 border-muted">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {filteredSessions.length === 0 ? (
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm p-12 text-center">
          <div className="mx-auto size-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <LayoutGrid className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No sessions found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search query.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <Card
              key={session._id}
              className="group border-none shadow-sm bg-card/50 backdrop-blur-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="h-2 bg-sky-500/20 group-hover:bg-sky-500 transition-colors duration-300" />
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge
                    variant="secondary"
                    className="bg-sky-500/10 text-sky-600 border-none font-medium"
                  >
                    {classMap[session.class] || "General"}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="size-3" />
                    {session.session_date}
                  </div>
                </div>
                <CardTitle className="text-xl group-hover:text-sky-500 transition-colors">
                  {session.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
                    <Clock className="size-3.5" />
                    <span className="font-mono text-[10px]">
                      {to12Hour(session.start_time)} -{" "}
                      {to12Hour(session.end_time)}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 italic border-l-2 border-muted pl-3">
                  {session.remarks || "No additional remarks for this session."}
                </p>

                <div className="pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full justify-between group/btn"
                        variant="outline"
                      >
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="size-4 text-emerald-500" />
                          Record Attendance
                        </span>
                        <ArrowRight className="size-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl w-full max-h-screen">
                      <DialogHeader>
                        <div className="size-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-2">
                          <Users className="size-6 text-emerald-500" />
                        </div>
                        <DialogTitle>
                          Mark Attendance: {session.name}
                        </DialogTitle>
                        <DialogDescription>
                          This feature is coming soon. You will be able to
                          select students from {classMap[session.class]} and
                          mark their presence.
                        </DialogDescription>
                      </DialogHeader>
                      {/*<div className="py-6 flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed rounded-lg bg-muted/30">
                        <div className="animate-bounce">
                          <LayoutGrid className="size-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">
                          Student list interface currently under development
                        </p>
                      </div>*/}
                      <AttendanceForm
                        sessionId={session._id}
                        classId={session.class}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendanceTable;
