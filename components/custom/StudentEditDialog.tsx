"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

const studentDetailsSchema = z.object({
  roll_number: z.string({ error: "Roll number must be a number" }),
  name: z.string({ error: "Name must be a string" }),
  email: z.string({ error: "Email must be a string" }),
  phone: z
    .string()
    .min(10, { error: "Phone numbers are only 10 digits" })
    .max(10, { error: "Phone numbers are only 10 digits" }),
  dob: z.string({ error: "DOB must be a string" }),
});

type StudentDetails = z.infer<typeof studentDetailsSchema>;

interface StudentEditDialogProps {
  student: {
    _id: Id<"students">;
    roll_number: string;
    name: string;
    email: string;
    phone: string;
    dob: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentEditDialog({
  student,
  isOpen,
  onClose,
}: StudentEditDialogProps) {
  const form = useForm<StudentDetails>({
    resolver: zodResolver(studentDetailsSchema),
    values: student
      ? {
          name: student.name,
          roll_number: student.roll_number,
          email: student.email,
          phone: student.phone,
          dob: student.dob,
        }
      : undefined,
  });

  const updateStudent = useMutation(api.functions.mutations.updateStudent);

  const handleSubmit = async (values: StudentDetails) => {
    if (!student) return;
    try {
      const result = await updateStudent({
        id: student._id,
        ...values,
      });
      if (result.status) {
        toast.success("Student record updated successfully");
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error updating student record:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>
            Update the details for {student?.name}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roll_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roll Number</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
