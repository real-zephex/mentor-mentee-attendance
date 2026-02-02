"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Id } from "@/convex/_generated/dataModel";

const StudentsList = () => {
  const data = useQuery(api.functions.queries.getStudents);
  const removeStudent = useMutation(api.functions.mutations.removeStudent);

  const handleDeleteStudent = async (studentId: Id<"students">) => {
    try {
      const result = await removeStudent({ id: studentId });
      if (result.status) {
        toast.success("Student removed successfully");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred while deleting the student");
      console.error("Error deleting student:", error);
    }
  };

  if (!data) {
    return <div className="text-center text-gray-500">Loading students...</div>;
  }

  const students = data.students || [];

  if (students.length === 0) {
    return (
      <div className="text-center text-gray-500">
        No students found in the database.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Roll Number</TableHead>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Phone</TableHead>
            <TableHead className="font-semibold">Date of Birth</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students
            .sort((a, b) => parseInt(a.roll_number) - parseInt(b.roll_number))
            .map((student) => (
              <TableRow key={student._id}>
                <TableCell className="font-medium">
                  {student.roll_number}
                </TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.phone}</TableCell>
                <TableCell>{student.dob}</TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete{" "}
                          <strong>{student.name}</strong> (Roll:{" "}
                          {student.roll_number})? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="flex justify-end gap-4">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteStudent(student._id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </div>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <div className="mt-4 text-sm text-gray-600">
        Total Students: <strong>{students.length}</strong>
      </div>
    </div>
  );
};

export default StudentsList;
