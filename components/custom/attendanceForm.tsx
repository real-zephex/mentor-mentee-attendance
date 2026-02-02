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
import { useState } from "react";

import { toast } from "sonner";

const NewAttendanceObject = z.object({
  class_session_id: z.string(),
});

type NewAttendanceType = z.Infer<typeof NewAttendanceObject>;

type AttendanceObj = {
  attendance_id: string;
  class_session_id: string;
  student_id: string;
  status: string;
};

const NewAttendanceForm = () => {
  const students = useQuery(api.functions.queries.getStudents);
  const sessions = useQuery(api.functions.queries.getSessions);
  const createAttendance = useMutation(api.functions.mutations.addAttendance);

  const [stuRecords, setStuRecords] = useState<
    { id: string; status: string }[]
  >([]);

  const form = useForm<NewAttendanceType>({
    resolver: zodResolver(NewAttendanceObject),
    defaultValues: {
      class_session_id: sessions?.todaySessions[0]
        ? sessions.todaySessions[0].session_id
        : "",
    },
  });

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

    const entries: AttendanceObj[] = [];
    for (const i of stuRecords) {
      const finalDataEntry = {
        attendance_id: crypto.randomUUID(),
        class_session_id: data.class_session_id,
        student_id: i.id,
        status: i.status === "Present" ? "Present" : "Absent",
      };
      entries.push(finalDataEntry);
    }

    const successIds: string[] = [];
    for (const i of entries) {
      const result = await createAttendance(i);
      if (result.status) {
        successIds.push(result.id!);
        toast(`Attendance added successfully for student ${i.student_id}`);
        console.info(`ID: ${result.id} \nAttendance added successfully`);
      } else {
        console.error(`Error adding attendance: ${result.message}`);
      }
    }

    if (successIds.length === entries.length) {
      toast.success(
        `Attendance added successfully for ${successIds.length} students.`,
      );
    } else {
      toast.warning(
        `Attendance added for ${successIds.length}/${entries.length} students.`,
      );
    }
  };

  const handleChangeAttendance = (id: string, status: boolean) => {
    if (stuRecords.length === 0 && students && students?.count > 0) {
      const newData = students.students.map((i) => ({
        id: i._id,
        status: "Absent",
      }));
      setStuRecords(newData);
    }

    const message = status ? "Present" : "Absent";
    console.log(message);
    setStuRecords((prev) => {
      const index = prev.findIndex((record) => record.id === id);
      if (index === -1) return [...prev, { id, status: message }];
      const updated = [...prev];
      updated[index].status = message;
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
                  disabled={sessions?.todaySessionCount === 0}
                  onValueChange={(e) => form.setValue("class_session_id", e)}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {sessions?.todaySessions.map((i, idx) => (
                        <SelectItem key={idx} value={i._id}>
                          Session - {idx + 1} | {i.start_time}
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
              <TableHead className="font-semibold text-center">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students?.students
              .sort((a, b) => parseInt(a.roll_number) - parseInt(b.roll_number))
              .map((student) => (
                <TableRow key={student._id}>
                  <TableCell>{student.roll_number}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="checkbox"
                      className="size-4"
                      onChange={(e) =>
                        handleChangeAttendance(student._id, e.target.checked)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <Button
          disabled={students?.count === 0 || sessions?.todaySessionCount === 0}
        >
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default NewAttendanceForm;
