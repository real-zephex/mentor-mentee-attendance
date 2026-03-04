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

const sessionSchema = z.object({
  session_id: z.string(),
  session_date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  remarks: z.string(),
});

type SessionDetails = z.infer<typeof sessionSchema>;

interface SessionEditDialogProps {
  session: {
    _id: Id<"sessions">;
    session_id: string;
    session_date: string;
    start_time: string;
    end_time: string;
    remarks: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SessionEditDialog({
  session,
  isOpen,
  onClose,
}: SessionEditDialogProps) {
  const form = useForm<SessionDetails>({
    resolver: zodResolver(sessionSchema),
    values: session
      ? {
          session_id: session.session_id,
          session_date: session.session_date,
          start_time: session.start_time,
          end_time: session.end_time,
          remarks: session.remarks,
        }
      : undefined,
  });

  const updateSession = useMutation(api.functions.mutations.updateSession);

  const handleSubmit = async (values: SessionDetails) => {
    if (!session) return;
    try {
      const result = await updateSession({
        id: session._id,
        ...values,
      });
      if (result.status) {
        toast.success("Session updated successfully");
        onClose();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Error updating session:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Session</DialogTitle>
          <DialogDescription>Update the details for this session.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="session_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                    <Input type="time" {...field} />
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
                    <Input type="time" {...field} />
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
                    <Input {...field} />
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
