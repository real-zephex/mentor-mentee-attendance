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
      if (result.status) console.info("Session added successfully");
      alert(result.message);
    } catch (error) {
      console.error(`Error adding session: ${error}`);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="session_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session ID</FormLabel>
              <FormControl>
                <Input {...field} disabled />
              </FormControl>
              <FormDescription>
                This is a unique identifier for the session.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="session_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session Date</FormLabel>
              <FormControl>
                <Input {...field} type="date" />
              </FormControl>
              <FormDescription>The date of the session.</FormDescription>
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
              <FormDescription>The start time of the session.</FormDescription>
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
              <FormDescription>The end time of the session.</FormDescription>
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
                <Input {...field} />
              </FormControl>
              <FormDescription>
                Any additional remarks about the session.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Add Session</Button>
      </form>
    </Form>
  );
};

export default NewSessionForm;
