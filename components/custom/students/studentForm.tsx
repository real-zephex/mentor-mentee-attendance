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
} from "../../ui/select";
import { Input } from "../../ui/input";
import { cn } from "@/lib/utils";
import { Button } from "../../ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const StudentEntryObject = z.object({
  name: z
    .string()
    .max(50, { error: "Name cannot be longer than 50 characters" })
    .min(5, { error: "Name cannot be shorter than 5 characters" }),
  roll_no: z.string({ error: "Roll No is required." }),
  class: z.string({ error: "Class ID is required." }),
});

type StudentEntryType = z.infer<typeof StudentEntryObject>;

import { toast } from "sonner";

const StudentForm = ({
  data,
  classes,
  id,
  action,
}: {
  data?: StudentEntryType;
  classes: Record<string, string>;
  id?: Id<"students">;
  action: "patch" | "add";
}) => {
  const patchStudents = useMutation(
    api.functions.students_actions.patchStudents,
  );
  const newStudent = useMutation(api.functions.students_actions.newStudents);

  const form = useForm<StudentEntryType>({
    resolver: zodResolver(StudentEntryObject),
    defaultValues: {
      name: data?.name || "",
      roll_no: data?.roll_no || "",
      class: data?.class || "",
    },
  });
  const classValue = form.watch("class");

  async function onSubmit(values: StudentEntryType) {
    try {
      const payload = {
        name: values.name,
        roll_no: values.roll_no,
        class: values.class as Id<"classes">,
      } as const;
      if (action === "patch") {
        if (!id) return;
        await patchStudents({
          id,
          data: payload,
        });
        toast.success("Student updated successfully");
      } else if (action === "add") {
        await newStudent(payload);
        toast.success("Student added successfully");
        form.reset();
      }
    } catch (error) {
      toast.error(`Error: ${(error as Error).message}`);
      console.error(
        `Error occured while editing student information: ${(error as Error).message}`,
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          name="name"
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
                  placeholder="Sumit Kumar"
                  className={cn(
                    "bg-background/70 border-border/70",
                    "focus-visible:ring-primary/40",
                  )}
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground">
                Name of the student
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="roll_no"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-end">
                <FormLabel className="text-sm font-semibold">Roll No</FormLabel>
                {/*<span className={cn("text-[10px] font-mono")}>
                  {titleValue}/100
                </span>*/}
              </div>
              <FormControl>
                <Input
                  type="text"
                  {...field}
                  placeholder="24100030054"
                  className={cn(
                    "bg-background/70 border-border/70",
                    "focus-visible:ring-primary/40",
                  )}
                />
              </FormControl>
              <FormDescription className="text-xs text-muted-foreground">
                Roll number of the student
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="class"
          control={form.control}
          render={({ }) => (
            <FormItem>
              <FormLabel>Class</FormLabel>
              <FormControl>
                <Select
                  onValueChange={(e) => form.setValue("class", e)}
                  value={classValue}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={classValue ? classes[classValue] : "Change Class"} />
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
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" variant="outline">
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default StudentForm;
