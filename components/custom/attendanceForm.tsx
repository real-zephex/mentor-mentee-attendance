"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { toast } from "sonner";

const NewAttendanceObject = z.object({
  class_session_id: z.string(),
});

type NewAttendanceType = z.Infer<typeof NewAttendanceObject>;

const NewAttendanceForm = () => {
  const students = useQuery(api.functions.queries.getStudents);
  const sessions = useQuery(api.functions.queries.getSessions);
  const bulkUpdateAttendance = useMutation(api.functions.mutations.bulkUpdateAttendance);

  const [stuRecords, setStuRecords] = useState<{ id: string; status: string }[]>([]);

  const form = useForm<NewAttendanceType>({
    resolver: zodResolver(NewAttendanceObject),
    defaultValues: {
      class_session_id: "",
    },
  });

  // @react-compiler-ignore - React Hook Form's watch is intentionally not memoized safe
  const selectedSessionId = form.watch("class_session_id");
  const existingAttendance = useQuery(
    api.functions.queries.getAttendanceBySession,
    selectedSessionId ? { class_session_id: selectedSessionId } : "skip"
  );

  useEffect(() => {
    if (existingAttendance && students) {
      const records = students.students.map((student) => {
        const existing = existingAttendance.find(
          (a) => a.student_id === student._id
        );
        return {
          id: student._id,
          status: existing ? existing.status : "Absent",
        };
      });
      setStuRecords(records);
    } else if (students && stuRecords.length === 0) {
      const records = students.students.map((student) => ({
        id: student._id,
        status: "Absent",
      }));
      setStuRecords(records);
    }
  }, [existingAttendance, students]);

  const handleMarkAll = (status: "Present" | "Absent") => {
    if (!students) return;
    const records = students.students.map((student) => ({
      id: student._id,
      status,
    }));
    setStuRecords(records);
  };

  const handleSubmit = async (data: NewAttendanceType) => {
    if (form.getValues("class_session_id") === "") {
      toast.error("Please select a class session!");
      return;
    }

    if (stuRecords.length === 0) {
      toast.error(
        "No attendance marked! Please mark atleast one student present.",
      );
      return;
    }

    const updates = stuRecords.map((i) => ({
      class_session_id: data.class_session_id,
      student_id: i.id,
      status: i.status,
    }));

    const result = await bulkUpdateAttendance({ updates });
    if (result.status) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleChangeAttendance = (id: string, isPresent: boolean) => {
    const status = isPresent ? "Present" : "Absent";
    setStuRecords((prev) => {
      const index = prev.findIndex((record) => record.id === id);
      if (index === -1) return [...prev, { id, status }];
      const updated = [...prev];
      updated[index] = { ...updated[index], status };
      return updated;
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="class_session_id"
          render={({}) => (
            <FormItem>
              <FormLabel>Class Session ID</FormLabel>
              <FormControl>
                <Select
                  disabled={!sessions?.sessions || sessions.sessions.length === 0}
                  onValueChange={(e) => form.setValue("class_session_id", e)}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {sessions?.todaySessionCount &&
                      sessions.todaySessionCount > 0 ? (
                        <>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
                            Today&apos;s Sessions
                          </div>
                          {sessions.todaySessions.map((i, idx) => (
                            <SelectItem key={i._id} value={i._id}>
                              Session {idx + 1} | {i.start_time}
                            </SelectItem>
                          ))}
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase mt-2">
                            All Sessions
                          </div>
                        </>
                      ) : null}
                      {sessions?.sessions
                        .filter(
                          (s) =>
                            !sessions.todaySessions.some((ts) => ts._id === s._id)
                        )
                        .sort((a, b) =>
                          b.session_date.localeCompare(a.session_date)
                        )
                        .map((i) => (
                          <SelectItem key={i._id} value={i._id}>
                            {i.session_date} | {i.start_time}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                This is the unique identifier for the class session.
                {sessions?.todaySessionCount === 0 && (
                  <span className="text-red-600 font-semibold flex flex-row items-center gap-2">
                    {" "}
                    <AlertCircle size={12} /> Please add a session for today!
                  </span>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Table>
          <TableCaption>List of Students</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Roll No</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold text-center flex items-center justify-center gap-2">
                Status
                <div className="flex gap-1 ml-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => handleMarkAll("Present")}
                  >
                    All P
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => handleMarkAll("Absent")}
                  >
                    All A
                  </Button>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students?.students
              .sort((a, b) => parseInt(a.roll_number) - parseInt(b.roll_number))
              .map((student) => {
                const record = stuRecords.find((r) => r.id === student._id);
                return (
                  <TableRow key={student._id}>
                    <TableCell>{student.roll_number}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Input
                          type="checkbox"
                          className="size-4"
                          checked={record?.status === "Present"}
                          onChange={(e) =>
                            handleChangeAttendance(student._id, e.target.checked)
                          }
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <Button
          disabled={students?.count === 0 || !sessions?.sessions || sessions.sessions.length === 0}
        >
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default NewAttendanceForm;
