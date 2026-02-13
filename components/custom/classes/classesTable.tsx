"use client";

import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";

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
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Edit2Icon, PlusIcon, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClassForm from "./classesForm";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

const ManageClasses = () => {
  const classes = useQuery(api.functions.classes_queries.GetAllClasses);
  const deleteClassess = useMutation(api.functions.classes_actions.deleteClass);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (id: Id<"classes">, className: string) => {
    setIsDeleting(id);
    try {
      await deleteClassess({ class_id: id });
      toast.success(`${className} deleted successfully`);
    } catch (error) {
      console.error("Error while deleting classes: ", error);
      toast.error("Failed to delete class");
    } finally {
      setIsDeleting(null);
    }
  };

  if (classes === undefined || classes.status === "error") {
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
          <CardTitle className="text-2xl font-bold">Classes</CardTitle>
          <CardDescription>
            Manage your academic classes and rooms
          </CardDescription>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-sky-500 hover:bg-sky-600">
              <PlusIcon className="mr-2 size-4" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adding New Class</DialogTitle>
            </DialogHeader>
            <ClassForm action="add" />
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border border-muted/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-30 font-semibold">Short ID</TableHead>
                <TableHead className="font-semibold">Class Name</TableHead>
                <TableHead className="font-semibold">Year</TableHead>
                <TableHead className="font-semibold">Room</TableHead>
                <TableHead className="font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.data.length > 0 ? (
                classes.data.map((i, idx) => (
                  <TableRow
                    key={idx}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {i._id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium">
                      {i.class_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {i.class_year}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                        <div className="size-1.5 rounded-full bg-emerald-500" />
                        {i.room}
                      </div>
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
                              <DialogTitle>Editing {i.class_name}</DialogTitle>
                              <DialogDescription>
                                Update class information and room assignments
                              </DialogDescription>
                            </DialogHeader>
                            <ClassForm action="patch" data={i} id={i._id} />
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
                              <DialogTitle>Deleting {i.class_name}</DialogTitle>
                              <DialogDescription>
                                Are you sure? This action cannot be undone and
                                will affect associated student records.
                              </DialogDescription>
                            </DialogHeader>

                            <div className="flex flex-row items-center justify-end gap-3 pt-4">
                              <DialogClose asChild>
                                <Button variant="ghost">Cancel</Button>
                              </DialogClose>
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  handleDelete(i._id, i.class_name)
                                }
                                disabled={isDeleting === i._id}
                              >
                                {isDeleting === i._id
                                  ? "Deleting..."
                                  : "Delete Class"}
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
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No classes found.
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

export default ManageClasses;
