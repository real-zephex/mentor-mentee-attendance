"use client";

import { useMemo, useState } from "react";

import { useMutation, useQuery } from "convex/react";
import { Edit2Icon, PlusIcon, Trash } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ExamFormState = {
  name: string;
  semesterId: Id<"semesters"> | null;
  max_marks: number | null;
};

type ExamEditState = ExamFormState & { id: Id<"exams"> };

export function ExamsPanel() {
  const examsResponse = useQuery(api.functions.exams_queries.GetAllExams);
  const semestersResponse = useQuery(
    api.functions.semesters_queries.getAllSemesters,
  );
  const addExam = useMutation(api.functions.exams_actions.AddNewExam);
  const patchExam = useMutation(api.functions.exams_actions.patchExam);
  const deleteExam = useMutation(api.functions.exams_actions.deleteExam);

  const [formState, setFormState] = useState<ExamFormState>({
    name: "",
    semesterId: null,
    max_marks: null,
  });
  const [editState, setEditState] = useState<ExamEditState | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<Id<"exams"> | null>(null);

  const semesterMap = useMemo(() => {
    if (!semestersResponse || semestersResponse.status !== "success") return {};
    return semestersResponse.data.reduce<Record<string, string>>(
      (acc, semester) => {
        acc[semester._id] =
          `${semester.academic_year} • Semester ${semester.number}`;
        return acc;
      },
      {},
    );
  }, [semestersResponse]);

  const semesterIds = useMemo(() => {
    if (!semestersResponse || semestersResponse.status !== "success") return [];
    return semestersResponse.data.map((semester) => semester._id);
  }, [semestersResponse]);

  const sortedExams = useMemo(() => {
    if (!examsResponse || examsResponse.status !== "success") return [];
    return [...examsResponse.data].sort((a, b) => a.name.localeCompare(b.name));
  }, [examsResponse]);

  const handleCreate = async () => {
    if (
      !formState.name.trim() ||
      !formState.semesterId ||
      !formState.max_marks
    ) {
      toast.error("Fill out all exam details before saving");
      return;
    }

    setIsSaving(true);
    try {
      await addExam({
        name: formState.name.trim(),
        semester: formState.semesterId,
        max_marks: formState.max_marks,
      });
      toast.success("Exam created successfully");
      setFormState({ name: "", semesterId: null, max_marks: 0 });
      setIsCreateOpen(false);
    } catch (error) {
      console.error("Failed to create exam:", error);
      toast.error("Failed to create exam");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editState) return;

    if (
      !editState.name.trim() ||
      !editState.semesterId ||
      !editState.max_marks
    ) {
      toast.error("Fill out all exam details before saving");
      return;
    }

    setIsUpdating(true);
    try {
      await patchExam({
        exam_id: editState.id,
        data: {
          name: editState.name.trim(),
          semester: editState.semesterId,
          max_marks: editState.max_marks,
        },
      });
      toast.success("Exam updated successfully");
      setEditState(null);
    } catch (error) {
      console.error("Failed to update exam:", error);
      toast.error("Failed to update exam");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (examId: Id<"exams">, examName: string) => {
    setIsDeleting(examId);
    try {
      await deleteExam({ exam_id: examId });
      toast.success(`${examName} deleted successfully`);
    } catch (error) {
      console.error("Failed to delete exam:", error);
      toast.error("Failed to delete exam");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">Exams</CardTitle>
          <CardDescription>
            Track exams tied to specific semesters.
          </CardDescription>
        </div>

        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setFormState({ name: "", semesterId: null, max_marks: 0 });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="bg-sky-500 hover:bg-sky-600">
              <PlusIcon className="mr-2 size-4" />
              Add Exam
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Exam</DialogTitle>
              <DialogDescription>
                Provide an exam name and assign it to a semester.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Exam name"
                value={formState.name}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <Input
                placeholder="Maximum Marks"
                value={formState.max_marks ? formState.max_marks : ""}
                type="number"
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    max_marks: Number(e.target.value),
                  }))
                }
              />
              <div className="space-y-2">
                <Select
                  value={formState.semesterId ?? ""}
                  onValueChange={(value) =>
                    setFormState((prev) => ({
                      ...prev,
                      semesterId: value ? (value as Id<"semesters">) : null,
                    }))
                  }
                  disabled={
                    semestersResponse === undefined ||
                    semestersResponse.status === "error"
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {semesterIds.map((semesterId) => (
                        <SelectItem key={semesterId} value={semesterId}>
                          {semesterMap[semesterId]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {semestersResponse === undefined
                    ? "Loading semesters..."
                    : semestersResponse.status === "error"
                      ? "Failed to load semesters"
                      : "Assign this exam to a semester."}
                </p>
              </div>
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
                {isSaving ? "Saving..." : "Save Exam"}
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
                <TableHead className="font-semibold">Exam</TableHead>
                <TableHead className="font-semibold">Semester</TableHead>
                <TableHead className="font-semibold">M.M.</TableHead>

                <TableHead className="font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {examsResponse?.status === "success" && sortedExams.length > 0 ? (
                sortedExams.map((exam) => (
                  <TableRow
                    key={exam._id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="font-medium">{exam.name}</TableCell>
                    <TableCell>
                      {semesterMap[exam.semester] || "Unassigned"}
                    </TableCell>
                    <TableCell>{exam.max_marks}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Dialog
                          open={editState?.id === exam._id}
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
                                  id: exam._id,
                                  name: exam.name,
                                  semesterId: exam.semester,
                                  max_marks: exam.max_marks,
                                })
                              }
                            >
                              <Edit2Icon size={14} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Exam</DialogTitle>
                              <DialogDescription>
                                Update the exam name and semester assignment.
                              </DialogDescription>
                            </DialogHeader>
                            {editState && (
                              <div className="space-y-4">
                                <Input
                                  placeholder="Exam name"
                                  value={editState.name}
                                  onChange={(e) =>
                                    setEditState((prev) =>
                                      prev
                                        ? { ...prev, name: e.target.value }
                                        : prev,
                                    )
                                  }
                                />
                                <Input
                                  placeholder="Maximum Marks"
                                  value={
                                    editState.max_marks
                                      ? editState.max_marks
                                      : ""
                                  }
                                  onChange={(e) =>
                                    setEditState((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            max_marks: Number(e.target.value),
                                          }
                                        : prev,
                                    )
                                  }
                                />
                                <div className="space-y-2">
                                  <Select
                                    value={editState.semesterId ?? ""}
                                    onValueChange={(value) =>
                                      setEditState((prev) =>
                                        prev
                                          ? {
                                              ...prev,
                                              semesterId: value
                                                ? (value as Id<"semesters">)
                                                : null,
                                            }
                                          : prev,
                                      )
                                    }
                                    disabled={
                                      semestersResponse === undefined ||
                                      semestersResponse.status === "error"
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectGroup>
                                        {semesterIds.map((semesterId) => (
                                          <SelectItem
                                            key={semesterId}
                                            value={semesterId}
                                          >
                                            {semesterMap[semesterId]}
                                          </SelectItem>
                                        ))}
                                      </SelectGroup>
                                    </SelectContent>
                                  </Select>
                                  <p className="text-xs text-muted-foreground">
                                    {semestersResponse === undefined
                                      ? "Loading semesters..."
                                      : semestersResponse.status === "error"
                                        ? "Failed to load semesters"
                                        : "Assign this exam to a semester."}
                                  </p>
                                </div>
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
                              <DialogTitle>Delete {exam.name}</DialogTitle>
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
                                  handleDelete(exam._id, exam.name)
                                }
                                disabled={isDeleting === exam._id}
                              >
                                {isDeleting === exam._id
                                  ? "Deleting..."
                                  : "Delete Exam"}
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
                    {examsResponse === undefined
                      ? "Loading exams..."
                      : examsResponse.status === "error"
                        ? `Failed to load exams. ${examsResponse.error}`
                        : "No exams found."}
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
