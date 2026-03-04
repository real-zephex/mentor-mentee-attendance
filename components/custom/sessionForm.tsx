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
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import SessionsList from "./SessionsList";

const NewSessionSchema = z.object({
  session_id: z.string(),
  session_date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  remarks: z.string(),
});

type NewSessionType = z.infer<typeof NewSessionSchema>;

const NewSessionForm = () => {
  const form = useForm<NewSessionType>({
    resolver: zodResolver(NewSessionSchema),
    defaultValues: {
      session_id: crypto.randomUUID(),
      session_date: new Date().toISOString().split("T")[0],
      start_time: "09:00",
      end_time: "17:00",
      remarks: "",
    },
  });
  const mutate = useMutation(api.functions.mutations.addSessions);

  const handleSubmit = async (values: NewSessionType) => {
    try {
      const result = await mutate(values);
      if (result.status) {
        toast.success("Session added successfully");
        form.reset({
          session_id: crypto.randomUUID(),
          session_date: new Date().toISOString().split("T")[0],
          start_time: "09:00",
          end_time: "17:00",
          remarks: "",
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(`Error adding session: ${error}`);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Session</CardTitle>
          <CardDescription>Create a new mentoring session.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="session_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="remarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Optional remarks" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit">Add Session</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>All Sessions</CardTitle>
          <CardDescription>View and manage all mentoring sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <SessionsList />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewSessionForm;
