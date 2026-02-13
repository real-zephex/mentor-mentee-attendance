"use client";

import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";

// ui imports
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "../../ui/button";
import { Edit2Icon, PlusIcon, Search, Trash, UserCircle } from "lucide-react";
import { Input } from "../../ui/input";
import StudentForm from "./studentForm";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Id } from "@/convex/_generated/dataModel";

const StudentTable = () => {
  const students = useQuery(api.functions.students_queries.getAllStudents);
  const deleteStudent = useMutation(
    api.functions.students_actions.deleteStudent,
  );
  const classes = useQuery(api.functions.classes_queries.GetAllClasses);

  const [name, setName] = useState<string>("");
  const [classMap, setClassMap] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState("newest");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [prioritizeClass] = useState<string>("none");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Sorting and filtering logic
  const studentsRecords = useMemo(() => {
    if (!students || students.status === "error") return;

    let newStudents = students.data;
    if (name) {
      const query = name.toLocaleLowerCase();
      newStudents = newStudents.filter(
        (i) =>
          i.name.toLocaleLowerCase().includes(query) ||
          i.roll_no.includes(query),
      );
    }

    if (classFilter !== "all") {
      newStudents = newStudents.filter((i) => i.class === classFilter);
    }

    newStudents.sort((a, b) => {
      // First, check if we're prioritizing a specific class
      if (prioritizeClass !== "none") {
        const aIsPrioritized = a.class === prioritizeClass;
        const bIsPrioritized = b.class === prioritizeClass;
        if (aIsPrioritized && !bIsPrioritized) return -1;
        if (!aIsPrioritized && bIsPrioritized) return 1;
      }

      // Then apply secondary sort
      if (sortBy === "newest") return b._creationTime - a._creationTime;
      if (sortBy === "oldest") return a._creationTime - b._creationTime;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "roll_no") return a.roll_no.localeCompare(b.roll_no);
      return 0;
    });

    return newStudents;
  }, [name, students, sortBy, classFilter, prioritizeClass]);

  // Creating a record of class_id -> class_name
  useEffect(() => {
    function getMap() {
      if (!classes || classes?.status == "error") return;

      const tempMap: Record<string, string> = {};
      for (const i of classes.data) {
        const class_id = i._id;
        const class_name = i.class_name;
        tempMap[class_id] = class_name;
      }
      setClassMap(tempMap);
    }

    getMap();
  }, [classes]);

  const handleDelete = async (id: Id<"students">, studentName: string) => {
    setIsDeleting(id);
    try {
      await deleteStudent({ student_id: id });
      toast.success(`${studentName} deleted successfully`);
    } catch (error) {
      console.error("Error while deleting student: ", error);
      toast.error("Failed to delete student");
    } finally {
      setIsDeleting(null);
    }
  };
  if (students === undefined || students.status === "error") {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">

          <div className="size-12 rounded-full bg-muted animate-pulse mb-4" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded mb-2" />
          <div className="h-3 w-32 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">Students</CardTitle>
          <CardDescription>
            Manage and view all registered students
          </CardDescription>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-sky-500 hover:bg-sky-600">
              <PlusIcon className="mr-2 size-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex flex-row items-center gap-2">
                <UserCircle className="text-muted-foreground" />
                <p>New Student</p>
              </DialogTitle>
            </DialogHeader>
            <StudentForm action="add" classes={classMap} />
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or roll no..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 bg-background/50 border-muted"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select defaultValue="all" onValueChange={(v) => setClassFilter(v)}>
              <SelectTrigger className="w-37.5 bg-background/50 border-muted">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Classes</SelectItem>
                  {Object.entries(classMap).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select defaultValue="newest" onValueChange={(v) => setSortBy(v)}>
              <SelectTrigger className="w-37.5 bg-background/50 border-muted">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="roll_no">Roll No</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border border-muted/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-25 font-semibold">Roll No</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Class</TableHead>
                <TableHead className="font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsRecords && studentsRecords.length > 0 ? (
                studentsRecords.map((i) => (
                  <TableRow
                    key={i._id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {i.roll_no}
                    </TableCell>
                    <TableCell className="font-medium">{i.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="font-normal bg-muted/50"
                      >
                        {classMap[String(i.class)] || "No Class"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 hover:text-sky-500"
                            >
                              <Edit2Icon size={14} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Editing {i.roll_no} - {i.name}
                              </DialogTitle>
                              <DialogDescription>
                                Edit Student Information
                              </DialogDescription>
                            </DialogHeader>
                            <StudentForm
                              data={i}
                              classes={classMap}
                              id={i._id}
                              action="patch"
                            />
                          </DialogContent>
                        </Dialog>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash size={14} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>
                                Are you absolutely sure?
                              </DialogTitle>
                              <DialogDescription>
                                This action cannot be undone. This will remove
                                entry of{" "}
                                <span className="font-semibold text-foreground">
                                  {i.name}
                                </span>{" "}
                                from the database.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-row items-center justify-end gap-3 pt-4">
                              <DialogClose asChild>
                                <Button variant="ghost">Cancel</Button>
                              </DialogClose>
                              <Button
                                variant="destructive"
                                onClick={() => handleDelete(i._id, i.name)}
                                disabled={isDeleting === i._id}
                              >
                                {isDeleting === i._id
                                  ? "Deleting..."
                                  : "Delete Student"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentTable;
