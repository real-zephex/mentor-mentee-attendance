"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const SessionEntryObject = z.object({
  name: z
    .string({ error: "Session name is required" })
    .min(3, { error: "Session name must be at least 3 characters" })
    .max(50, { error: "Session name cannot exceed 50 characters" }),
  class: z.string({ error: "Class is required" }),
  session_date: z.string({ error: "Date is required" }),
  start_time: z.string({ error: "Start time is required" }),
  end_time: z.string({ error: "End time is required" }),
  remarks: z.string().optional(),
  subject: z.string({ error: "Subject is required." }),
  created_by: z.string({ error: "Creator information is required." }),
});

type SessionEntryType = z.infer<typeof SessionEntryObject>;

import { toast } from "sonner";
import { Doc } from "@/convex/_generated/dataModel";
import { useAuthCheck } from "@/hooks/useAuthCheck";

const SessionForm = ({
  data,
  classes,
  id,
  action,
}: {
  data?: Doc<"sessions">;
  classes: Record<string, string>;
  id?: Id<"sessions">;
  action: "patch" | "add";
}) => {
  const { user } = useAuthCheck();

  const patchSession = useMutation(
    api.functions.sessions_actions.patchSessions,
  );
  const newSession = useMutation(api.functions.sessions_actions.newSession);
  const subject = useQuery(api.functions.subjects_queries.GetTeacherSubjects, {
    teacherId: user!._id, // MARK: all subjects
  });
  const form = useForm<SessionEntryType>({
    resolver: zodResolver(SessionEntryObject),
    defaultValues: {
      name: data?.name || "",
      class: data?.class || "",
      session_date: data?.session_date || "",
      start_time: data?.start_time || "",
      end_time: data?.end_time || "",
      remarks: data?.remarks || "",
      subject: data?.subject || "",
      created_by: data?.created_by || "",
    },
  });

  async function onSubmit(values: SessionEntryType) {
    try {
      const payload = {
        name: values.name,
        class: values.class as Id<"classes">,
        session_date: values.session_date,
        start_time: values.start_time,
        end_time: values.end_time,
        remarks: values.remarks || "",
        subject: values.subject as Id<"subjects">,
        created_by: user!._id,
      };

      if (action === "patch") {
        if (!id) return;
        await patchSession({
          id,
          data: payload,
        });
        toast.success("Session updated successfully");
      } else if (action === "add") {
        await newSession(payload);
        toast.success("Session created successfully");
        form.reset();
      }
    } catch (error) {
      toast.error(`Error: ${(error as Error).message}`);
      console.error(
        `Error occurred while ${action === "patch" ? "editing" : "adding"} session: ${(error as Error).message}`,
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-end">
                <FormLabel className="text-sm font-semibold">
                  Session Name
                </FormLabel>
              </div>
              <FormControl>
                <Input
                  type="text"
                  {...field}
                  placeholder="Introduction to Programming"
                  className={cn(
                    "bg-background/70 border-border/70",
                    "focus-visible:ring-primary/40",
                  )}
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground">
                Name of the session
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-row items-center gap-4">
          <FormField
            name="class"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">Class</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={cn(
                        "bg-background/70 border-border/70",
                        "focus:ring-primary/40",
                      )}
                    >
                      <SelectValue
                        placeholder={
                          field.value ? classes[field.value] : "Select a class"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.entries(classes).map(([key, value], idx) => (
                          <SelectItem key={idx} value={key}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription className="text-xs text-muted-foreground">
                  Class for this session
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="subject"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">Subject</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={cn(
                        "bg-background/70 border-border/70",
                        "focus:ring-primary/40",
                      )}
                    >
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {subject?.status === "success" &&
                          subject?.data.map((sub, idx) => (
                            <SelectItem key={idx} value={sub._id}>
                              {sub.subject_name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription className="text-xs text-muted-foreground">
                  Subject for this session
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          name="session_date"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  className={cn(
                    "bg-background/70 border-border/70",
                    "focus-visible:ring-primary/40",
                  )}
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground">
                Date of the session
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            name="start_time"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">
                  Start Time
                </FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    className={cn(
                      "bg-background/70 border-border/70",
                      "focus-visible:ring-primary/40",
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="end_time"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">
                  End Time
                </FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    className={cn(
                      "bg-background/70 border-border/70",
                      "focus-visible:ring-primary/40",
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          name="remarks"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold">
                Remarks (Optional)
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Add any additional notes..."
                  className={cn(
                    "bg-background/70 border-border/70 min-h-20",
                    "focus-visible:ring-primary/40",
                  )}
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground">
                Additional notes or remarks about the session
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" variant="outline">
          {action === "add" ? "Create Session" : "Update Session"}
        </Button>
      </form>
    </Form>
  );
};

export default SessionForm;
