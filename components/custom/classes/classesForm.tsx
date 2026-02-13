import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";

import * as z from "zod";
import { Id } from "@/convex/_generated/dataModel";

const NewClass = z.object({
  class_name: z
    .string({ error: "Class name is required." })
    .max(20, { error: "Class name cannot be longer than 20 characters." })
    .min(5, { error: "Class name cannot be shorter than 5 characters." }),
  class_year: z
    .string({ error: "Class year is required." })
    .min(4, { error: "Year cannot be shorter than 4 characters." })
    .max(4, { error: "Year cannot be longer than 4 characters." }),
  room: z
    .string({ error: "Room is required." })
    .min(2, { error: "Room name cannot be shorter than 2 characters." })
    .max(4, { error: "Room name cannot be longer than 4 characters." }),
});

type NewClassType = z.infer<typeof NewClass>;

import { toast } from "sonner";

const ClassForm = ({
  data,
  action,
  id,
}: {
  data?: NewClassType;
  action: "patch" | "add";
  id?: Id<"classes">;
}) => {
  const patchClassess = useMutation(api.functions.classes_actions.patchClass);
  const addClassess = useMutation(api.functions.classes_actions.newClass);

  const form = useForm<NewClassType>({
    resolver: zodResolver(NewClass),
    defaultValues: {
      class_name: data?.class_name || "",
      class_year: data?.class_year || "",
      room: data?.room || "",
    },
  });

  const onSubmit = async (data: NewClassType) => {
    try {
      if (action === "add") {
        await addClassess(data);
        toast.success("Class added successfully");
        form.reset();
      } else {
        if (!id) return;
        await patchClassess({ id, data });
        toast.success("Class updated successfully");
      }
    } catch (error) {
      toast.error(`Error: ${error}`);
      console.error(`Error while ${action} operation: ${error} `);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2"
      >
        <FormField
          name="class_name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-end">
                <FormLabel className="text-sm font-semibold">Name</FormLabel>
                {/*<span className={cn("text-[10px] font-mono")}>
                  {titleValue}/100
                </span>*/}
              </div>
              <FormControl>
                <Input
                  type="text"
                  {...field}
                  placeholder="Crypto"
                  // required
                  className={cn(
                    "bg-background/70 border-border/70",
                    "focus-visible:ring-primary/40",
                  )}
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground">
                Name of the class
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="class_year"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-end">
                <FormLabel className="text-sm font-semibold">Year</FormLabel>
                {/*<span className={cn("text-[10px] font-mono")}>
                  {titleValue}/100
                </span>*/}
              </div>
              <FormControl>
                <Input
                  type="text"
                  {...field}
                  placeholder="2024"
                  // required
                  className={cn(
                    "bg-background/70 border-border/70",
                    "focus-visible:ring-primary/40",
                  )}
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground">
                Start year of the class
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="room"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-end">
                <FormLabel className="text-sm font-semibold">Room</FormLabel>
                {/*<span className={cn("text-[10px] font-mono")}>
                  {titleValue}/100
                </span>*/}
              </div>
              <FormControl>
                <Input
                  type="text"
                  {...field}
                  placeholder="2024"
                  // required
                  className={cn(
                    "bg-background/70 border-border/70",
                    "focus-visible:ring-primary/40",
                  )}
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground">
                Room in which this class is held
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button variant="outline" className="w-full" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default ClassForm;
