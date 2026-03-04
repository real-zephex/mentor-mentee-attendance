"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const newAttendanceSchema = z.object({
  class_session_id: z.string(),
});

type NewAttendanceType = z.infer<typeof newAttendanceSchema>;

type AttendanceRecord = { id: string; status: "Present" | "Absent" };

const NewAttendanceForm = () => {
  const students = useQuery(api.functions.queries.getStudents);
  const sessions = useQuery(api.functions.queries.getSessions);
  const bulkUpdateAttendance = useMutation(api.functions.mutations.bulkUpdateAttendance);

  const [stuRecords, setStuRecords] = useState<AttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<NewAttendanceType>({
    resolver: zodResolver(newAttendanceSchema),
    defaultValues: {
      class_session_id: "",
    },
  });

  const selectedSessionId = form.watch("class_session_id");

  const existingAttendance = useQuery(
    api.functions.queries.getAttendanceBySession,
    selectedSessionId ? { class_session_id: selectedSessionId } : "skip",
  );

  const selectedSession = useMemo(() => {
    if (!sessions?.sessions || !selectedSessionId) {
      return null;
    }
    return sessions.sessions.find((session) => session._id === selectedSessionId) ?? null;
  }, [sessions, selectedSessionId]);

  useEffect(() => {
    if (!students?.students) {
      return;
    }

    if (existingAttendance) {
      const records = students.students.map((student) => {
        const existing = existingAttendance.find((record) => record.student_id === student._id);
        return {
          id: student._id,
          status: (existing?.status ?? "Absent") as "Present" | "Absent",
        };
      });
      setStuRecords(records);
      return;
    }

    setStuRecords((previous) => {
      if (previous.length > 0) {
        return previous;
      }
      return students.students.map((student) => ({
        id: student._id,
        status: "Absent" as const,
      }));
    });
  }, [students, existingAttendance]);

  const handleMarkAll = (status: "Present" | "Absent") => {
    if (!students?.students) {
      return;
    }

    const records = students.students.map((student) => ({
      id: student._id,
      status,
    }));
    setStuRecords(records);
  };

  const handleResetToExisting = () => {
    if (!students?.students || !existingAttendance) {
      return;
    }

    const records = students.students.map((student) => {
      const existing = existingAttendance.find((record) => record.student_id === student._id);
      return {
        id: student._id,
        status: (existing?.status ?? "Absent") as "Present" | "Absent",
      };
    });

    setStuRecords(records);
  };

  const handleSubmit = async (data: NewAttendanceType) => {
    if (!data.class_session_id) {
      toast.error("Please select a session");
      return;
    }

    if (stuRecords.length === 0) {
      toast.error("No student records available to submit");
      return;
    }

    const updates = stuRecords.map((record) => ({
      class_session_id: data.class_session_id,
      student_id: record.id,
      status: record.status,
    }));

    setIsSaving(true);
    try {
      const result = await bulkUpdateAttendance({ updates });
      if (result.status) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Unable to update attendance right now");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeAttendance = (id: string, isPresent: boolean) => {
    const status: "Present" | "Absent" = isPresent ? "Present" : "Absent";
    setStuRecords((previous) => {
      const index = previous.findIndex((record) => record.id === id);
      if (index === -1) {
        return [...previous, { id, status }];
      }

      const updated = [...previous];
      updated[index] = { ...updated[index], status };
      return updated;
    });
  };

  const filteredStudents = useMemo(() => {
    if (!students?.students) {
      return [];
    }

    const term = searchTerm.trim().toLowerCase();
    return [...students.students]
      .sort((a, b) => Number(a.roll_number) - Number(b.roll_number))
      .filter((student) => {
        if (!term) {
          return true;
        }

        return (
          student.name.toLowerCase().includes(term) ||
          student.roll_number.toLowerCase().includes(term)
        );
      });
  }, [students, searchTerm]);

  const presentCount = stuRecords.filter((record) => record.status === "Present").length;
  const absentCount = stuRecords.length - presentCount;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">1. Select Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <FormField
              control={form.control}
              name="class_session_id"
              render={({}) => (
                <FormItem>
                  <FormLabel>Class Session</FormLabel>
                  <FormControl>
                    <Select
                      disabled={!sessions?.sessions || sessions.sessions.length === 0}
                      onValueChange={(value) => form.setValue("class_session_id", value)}
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select session" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {sessions?.todaySessionCount && sessions.todaySessionCount > 0 ? (
                            <>
                              <div className="px-2 py-1.5 text-xs font-semibold uppercase text-muted-foreground">
                                Today&apos;s Sessions
                              </div>
                              {sessions.todaySessions.map((session, index) => (
                                <SelectItem key={session._id} value={session._id}>
                                  Session {index + 1} | {session.start_time}
                                </SelectItem>
                              ))}
                              <div className="mt-2 px-2 py-1.5 text-xs font-semibold uppercase text-muted-foreground">
                                All Sessions
                              </div>
                            </>
                          ) : null}
                          {sessions?.sessions
                            .filter(
                              (session) =>
                                !sessions.todaySessions.some(
                                  (todaySession) => todaySession._id === session._id,
                                ),
                            )
                            .sort((a, b) => b.session_date.localeCompare(a.session_date))
                            .map((session) => (
                              <SelectItem key={session._id} value={session._id}>
                                {session.session_date} | {session.start_time}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Select the session you want to mark attendance for.
                    {sessions?.todaySessionCount === 0 ? (
                      <span className="mt-1 flex items-center gap-2 font-semibold text-red-600">
                        <AlertCircle size={12} /> No sessions for today. Add one in Sessions.
                      </span>
                    ) : null}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedSession ? (
              <div className="rounded-md border bg-muted/40 p-3 text-sm">
                Session: <strong>{selectedSession.session_date}</strong> | {selectedSession.start_time} - {" "}
                {selectedSession.end_time}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">2. Mark Attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Input
                placeholder="Search by name or roll number"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="md:max-w-sm"
              />
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => handleMarkAll("Present")}>
                  All Present
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => handleMarkAll("Absent")}>
                  All Absent
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={handleResetToExisting}>
                  Keep Existing
                </Button>
              </div>
            </div>

            <div className="hidden rounded-md border md:block">
              <Table>
                <TableCaption>List of students for selected session.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Roll No</TableHead>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="text-center font-semibold">Present</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const record = stuRecords.find((entry) => entry.id === student._id);
                    return (
                      <TableRow key={student._id}>
                        <TableCell>{student.roll_number}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={record?.status === "Present"}
                              onCheckedChange={(value) =>
                                handleChangeAttendance(student._id, value === true)
                              }
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-2 md:hidden">
              {filteredStudents.map((student) => {
                const record = stuRecords.find((entry) => entry.id === student._id);
                return (
                  <div key={student._id} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">Roll {student.roll_number}</p>
                    </div>
                    <Checkbox
                      checked={record?.status === "Present"}
                      onCheckedChange={(value) => handleChangeAttendance(student._id, value === true)}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="sticky bottom-2 z-10 rounded-md border bg-background p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span>Present: {presentCount}</span>
            <span>Absent: {absentCount}</span>
          </div>
          <Button
            className="w-full"
            disabled={
              isSaving ||
              students?.count === 0 ||
              !sessions?.sessions ||
              sessions.sessions.length === 0 ||
              !selectedSessionId
            }
          >
            {isSaving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Saving Attendance...
              </span>
            ) : (
              "Save Attendance"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewAttendanceForm;
