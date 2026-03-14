"use client";

import { useMemo, useState } from "react";

import { useMutation, useQuery } from "convex/react";
import { Edit2Icon, PlusIcon, Trash } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SemesterFormState = {
  academicYear: string;
  number: string;
};

type SemesterEditState = SemesterFormState & { id: Id<"semesters"> };

const getSemesterLabel = (academicYear: string, number: number) =>
  `${academicYear} • Semester ${number}`;

export function SemestersPanel() {
  const semestersResponse = useQuery(api.functions.semesters_queries.getAllSemesters);
  const addSemester = useMutation(api.functions.semesters_actions.addNewSemester);
  const patchSemester = useMutation(api.functions.semesters_actions.patchSemester);
  const deleteSemester = useMutation(api.functions.semesters_actions.deleteSemester);

  const [formState, setFormState] = useState<SemesterFormState>({
    academicYear: "",
    number: "",
  });
  const [editState, setEditState] = useState<SemesterEditState | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<Id<"semesters"> | null>(null);

  const sortedSemesters = useMemo(() => {
    if (!semestersResponse || semestersResponse.status !== "success") return [];
    return [...semestersResponse.data].sort((a, b) => {
      if (a.academic_year === b.academic_year) {
        return a.number - b.number;
      }
      return a.academic_year.localeCompare(b.academic_year);
    });
  }, [semestersResponse]);

  const handleCreate = async () => {
    if (!formState.academicYear.trim() || !formState.number.trim()) {
      toast.error("Fill out all semester details before saving");
      return;
    }

    const parsedNumber = Number.parseInt(formState.number, 10);
    if (Number.isNaN(parsedNumber) || parsedNumber <= 0) {
      toast.error("Semester number must be a positive number");
      return;
    }

    setIsSaving(true);
    try {
      const result = await addSemester({
        academic_year: formState.academicYear.trim(),
        number: parsedNumber,
      });

      if (result.status === "error") {
        toast.error(result.error);
        return;
      }

      toast.success("Semester created successfully");
      setFormState({ academicYear: "", number: "" });
      setIsCreateOpen(false);
    } catch (error) {
      console.error("Failed to create semester:", error);
      toast.error("Failed to create semester");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editState) return;

    if (!editState.academicYear.trim() || !editState.number.trim()) {
      toast.error("Fill out all semester details before saving");
      return;
    }

    const parsedNumber = Number.parseInt(editState.number, 10);
    if (Number.isNaN(parsedNumber) || parsedNumber <= 0) {
      toast.error("Semester number must be a positive number");
      return;
    }

    setIsUpdating(true);
    try {
      const result = await patchSemester({
        id: editState.id,
        data: {
          academic_year: editState.academicYear.trim(),
          number: parsedNumber,
        },
      });

      if (result.status === "error") {
        toast.error(result.error);
        return;
      }

      toast.success("Semester updated successfully");
      setEditState(null);
    } catch (error) {
      console.error("Failed to update semester:", error);
      toast.error("Failed to update semester");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (semesterId: Id<"semesters">, label: string) => {
    setIsDeleting(semesterId);
    try {
      const result = await deleteSemester({ sem_id: semesterId });
      if (result.status === "error") {
        toast.error(result.error);
        return;
      }

      toast.success(`${label} deleted successfully`);
    } catch (error) {
      console.error("Failed to delete semester:", error);
      toast.error("Failed to delete semester");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">Semesters</CardTitle>
          <CardDescription>
            Create semesters to organize subjects and sessions.
          </CardDescription>
        </div>

        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setFormState({ academicYear: "", number: "" });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="bg-sky-500 hover:bg-sky-600">
              <PlusIcon className="mr-2 size-4" />
              Add Semester
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Semester</DialogTitle>
              <DialogDescription>
                Provide an academic year and semester number.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Academic year (e.g. 2024-2025)"
                value={formState.academicYear}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    academicYear: e.target.value,
                  }))
                }
              />
              <Input
                type="number"
                min={1}
                placeholder="Semester number"
                value={formState.number}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    number: e.target.value,
                  }))
                }
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button
                className="bg-sky-500 hover:bg-sky-600"
                onClick={handleCreate}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Semester"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border border-muted/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-semibold">Academic Year</TableHead>
                <TableHead className="font-semibold">Semester</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {semestersResponse?.status === "success" && sortedSemesters.length > 0 ? (
                sortedSemesters.map((semester) => (
                  <TableRow
                    key={semester._id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {semester.academic_year}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {semester.number}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Dialog
                          open={editState?.id === semester._id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setEditState(null);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-8 hover:text-sky-500"
                              onClick={() =>
                                setEditState({
                                  id: semester._id,
                                  academicYear: semester.academic_year,
                                  number: String(semester.number),
                                })
                              }
                            >
                              <Edit2Icon size={14} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Semester</DialogTitle>
                              <DialogDescription>
                                Update the academic year and semester number.
                              </DialogDescription>
                            </DialogHeader>
                            {editState && (
                              <div className="space-y-4">
                                <Input
                                  placeholder="Academic year (e.g. 2024-2025)"
                                  value={editState.academicYear}
                                  onChange={(e) =>
                                    setEditState((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            academicYear: e.target.value,
                                          }
                                        : prev,
                                    )
                                  }
                                />
                                <Input
                                  type="number"
                                  min={1}
                                  placeholder="Semester number"
                                  value={editState.number}
                                  onChange={(e) =>
                                    setEditState((prev) =>
                                      prev
                                        ? { ...prev, number: e.target.value }
                                        : prev,
                                    )
                                  }
                                />
                              </div>
                            )}
                            <div className="flex justify-end gap-3 pt-4">
                              <DialogClose asChild>
                                <Button variant="ghost">Cancel</Button>
                              </DialogClose>
                              <Button
                                className="bg-sky-500 hover:bg-sky-600"
                                onClick={handleUpdate}
                                disabled={isUpdating}
                              >
                                {isUpdating ? "Saving..." : "Save Changes"}
                              </Button>
                            </div>
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
                              <DialogTitle>
                                Delete {getSemesterLabel(semester.academic_year, semester.number)}
                              </DialogTitle>
                              <DialogDescription>
                                This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-row items-center justify-end gap-3 pt-4">
                              <DialogClose asChild>
                                <Button variant="ghost">Cancel</Button>
                              </DialogClose>
                              <Button
                                variant="destructive"
                                onClick={() =>
                                  handleDelete(
                                    semester._id,
                                    getSemesterLabel(
                                      semester.academic_year,
                                      semester.number,
                                    ),
                                  )
                                }
                                disabled={isDeleting === semester._id}
                              >
                                {isDeleting === semester._id
                                  ? "Deleting..."
                                  : "Delete Semester"}
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
                    colSpan={3}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {semestersResponse === undefined
                      ? "Loading semesters..."
                      : semestersResponse.status === "error"
                        ? `Failed to load semesters. ${semestersResponse.error}`
                        : "No semesters found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
