"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "convex/react";
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

import { toast } from "sonner";

const newStudentDetailsSchema = z.object({
  roll_number: z.string({ error: "Roll number must be a number" }),
  name: z.string({ error: "Name must be a string" }),
  email: z.string({ error: "Email must be a string" }),
  phone: z
    .string()
    .min(10, { error: "Phone numbers are only 10 digits" })
    .max(10, { error: "Phone numbers are only 10 digits" }),
  dob: z.string({ error: "DOB must be a string" }),
});

type newStudentDetails = z.infer<typeof newStudentDetailsSchema>;

const NewStudent = () => {
  const form = useForm<newStudentDetails>({
    resolver: zodResolver(newStudentDetailsSchema),
    defaultValues: {
      name: "",
      roll_number: "",
      email: "",
      phone: "",
      dob: "",
    },
  });
  const mutate = useMutation(api.functions.mutations.addStudents);

  const handleSubmit = async (values: newStudentDetails) => {
    try {
      const result = await mutate(values);
      if (result.status) {
        toast.success("Student record added successfully");
        form.reset();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error adding student record:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="flex flex-col gap-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} autoComplete="off" />
                </FormControl>
                <FormDescription>Student name</FormDescription>
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
                  <Input
                    placeholder="25100030043"
                    {...field}
                    autoComplete="off"
                  />
                </FormControl>
                <FormDescription>Student roll number</FormDescription>
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
                  <Input
                    placeholder="john.doe@example.com"
                    {...field}
                    autoComplete="off"
                  />
                </FormControl>
                <FormDescription>Student email</FormDescription>
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
                  <Input
                    placeholder="98944 34345"
                    {...field}
                    autoComplete="off"
                  />
                </FormControl>
                <FormDescription>Student phonen number</FormDescription>
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
                  <Input
                    type="date"
                    placeholder="YYYY-MM-DD"
                    {...field}
                    autoComplete="off"
                  />
                </FormControl>
                <FormDescription>Student date of birth</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
};

export default NewStudent;
