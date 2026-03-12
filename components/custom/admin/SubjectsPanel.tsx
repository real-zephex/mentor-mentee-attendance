"use client";

import { useMemo, useState } from "react";

import { useMutation, useQuery } from "convex/react";
import { PlusIcon, Trash, Edit2Icon } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type TeacherMap = Record<string, { name: string; email: string }>;

type SubjectFormState = {
  name: string;
  code: string;
  teacherId: Id<"users"> | null;
};

type SubjectEditState = SubjectFormState & { id: Id<"subjects"> };

export function SubjectsPanel() {
  const subjectsResponse = useQuery(api.functions.subjects_queries.GetAllSubjects);
  const teachersResponse = useQuery(api.functions.users_queries.getActiveTeachers);
  const newSubject = useMutation(api.functions.subjects_actions.newSubject);
  const patchSubject = useMutation(api.functions.subjects_actions.patchSubject);
  const deleteSubject = useMutation(api.functions.subjects_actions.deleteSubject);

  const [formState, setFormState] = useState<SubjectFormState>({
    name: "",
    code: "",
    teacherId: null,
  });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editState, setEditState] = useState<SubjectEditState | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const teacherMap = useMemo(() => {
    if (!teachersResponse || teachersResponse.status === "error") return {};

    return teachersResponse.data.reduce<TeacherMap>((acc, teacher) => {
      acc[teacher._id] = { name: teacher.name, email: teacher.email };
      return acc;
    }, {});
  }, [teachersResponse]);

  const teacherIds = useMemo(() => {
    if (!teachersResponse || teachersResponse.status !== "success") return [];
    return teachersResponse.data.map((teacher) => teacher._id);
  }, [teachersResponse]);

  const getTeacherLabel = (teacherId: Id<"users"> | null) => {
    if (!teacherId) return "";
    const teacher = teacherMap[teacherId];
    if (!teacher) return "";
    return `${teacher.name} (${teacher.email})`;
  };

  const handleCreate = async () => {
    if (!formState.name.trim() || !formState.code.trim() || !formState.teacherId) {
      toast.error("Fill out all subject details before saving");
      return;
    }

    setIsSaving(true);
    try {
      await newSubject({
        subject_name: formState.name.trim(),
        subject_code: formState.code.trim(),
        teacher: formState.teacherId,
      });
      toast.success("Subject created successfully");
      setFormState({ name: "", code: "", teacherId: null });
      setIsCreateOpen(false);
    } catch (error) {
      console.error("Failed to create subject:", error);
      toast.error("Failed to create subject");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editState) return;

    if (!editState.name.trim() || !editState.code.trim() || !editState.teacherId) {
      toast.error("Fill out all subject details before saving");
      return;
    }

    setIsUpdating(true);
    try {
      await patchSubject({
        id: editState.id,
        data: {
          subject_name: editState.name.trim(),
          subject_code: editState.code.trim(),
          teacher: editState.teacherId,
        },
      });
      toast.success("Subject updated successfully");
      setEditState(null);
    } catch (error) {
      console.error("Failed to update subject:", error);
      toast.error("Failed to update subject");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (subjectId: Id<"subjects">, subjectName: string) => {
    setIsDeleting(subjectId);
    try {
      await deleteSubject({ subject_id: subjectId });
      toast.success(`${subjectName} deleted successfully`);
    } catch (error) {
      console.error("Failed to delete subject:", error);
      toast.error("Failed to delete subject");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">Subjects</CardTitle>
          <CardDescription>
            Create and manage subjects linked to active teachers.
          </CardDescription>
        </div>

        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setFormState({ name: "", code: "", teacherId: null });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="bg-sky-500 hover:bg-sky-600">
              <PlusIcon className="mr-2 size-4" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Subject</DialogTitle>
              <DialogDescription>
                Provide a subject name, unique code, and teacher assignment.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Subject name"
                value={formState.name}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <Input
                placeholder="Subject code"
                value={formState.code}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, code: e.target.value }))
                }
              />
              <Combobox
                value={formState.teacherId}
                onValueChange={(value) =>
                  setFormState((prev) => ({
                    ...prev,
                    teacherId: value ? (value as Id<"users">) : null,
                  }))
                }
                itemToStringLabel={(value) =>
                  getTeacherLabel(value as Id<"users">)
                }
                items={teacherIds}
              >
                <ComboboxInput
                  placeholder="Select teacher..."
                  showClear
                  disabled={
                    teachersResponse === undefined ||
                    teachersResponse.status === "error"
                  }
                />
                <ComboboxContent>
                  <ComboboxEmpty>
                    {teachersResponse === undefined
                      ? "Loading teachers..."
                      : "No active teachers found."}
                  </ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item} value={item}>
                        {getTeacherLabel(item as Id<"users">)}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
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
                {isSaving ? "Saving..." : "Save Subject"}
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
                <TableHead className="font-semibold">Subject</TableHead>
                <TableHead className="font-semibold">Code</TableHead>
                <TableHead className="font-semibold">Teacher</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjectsResponse?.status === "success" && subjectsResponse.data.length > 0 ? (
                subjectsResponse.data.map((subject) => (
                  <TableRow
                    key={subject._id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {subject.subject_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {subject.subject_code}
                    </TableCell>
                    <TableCell>
                      {getTeacherLabel(subject.teacher) || "Unknown"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        <Dialog
                          open={editState?.id === subject._id}
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
                                  id: subject._id,
                                  name: subject.subject_name,
                                  code: subject.subject_code,
                                  teacherId: subject.teacher,
                                })
                              }
                            >
                              <Edit2Icon size={14} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Subject</DialogTitle>
                              <DialogDescription>
                                Update subject details and teacher assignment.
                              </DialogDescription>
                            </DialogHeader>
                            {editState && (
                              <div className="space-y-4">
                                <Input
                                  placeholder="Subject name"
                                  value={editState.name}
                                  onChange={(e) =>
                                    setEditState((prev) =>
                                      prev
                                        ? { ...prev, name: e.target.value }
                                        : prev
                                    )
                                  }
                                />
                                <Input
                                  placeholder="Subject code"
                                  value={editState.code}
                                  onChange={(e) =>
                                    setEditState((prev) =>
                                      prev
                                        ? { ...prev, code: e.target.value }
                                        : prev
                                    )
                                  }
                                />
                                <Combobox
                                  value={editState.teacherId}
                                  onValueChange={(value) =>
                                    setEditState((prev) =>
                                      prev
                                        ? {
                                            ...prev,
                                            teacherId: value
                                              ? (value as Id<"users">)
                                              : null,
                                          }
                                        : prev
                                    )
                                  }
                                  itemToStringLabel={(value) =>
                                    getTeacherLabel(value as Id<"users">)
                                  }
                                  items={teacherIds}
                                >
                                  <ComboboxInput
                                    placeholder="Select teacher..."
                                    showClear
                                    disabled={
                                      teachersResponse === undefined ||
                                      teachersResponse.status === "error"
                                    }
                                  />
                                  <ComboboxContent>
                                    <ComboboxEmpty>
                                      {teachersResponse === undefined
                                        ? "Loading teachers..."
                                        : "No active teachers found."}
                                    </ComboboxEmpty>
                                    <ComboboxList>
                                      {(item) => (
                                        <ComboboxItem key={item} value={item}>
                                          {getTeacherLabel(item as Id<"users">)}
                                        </ComboboxItem>
                                      )}
                                    </ComboboxList>
                                  </ComboboxContent>
                                </Combobox>
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
                              <DialogTitle>Delete {subject.subject_name}</DialogTitle>
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
                                onClick={() => handleDelete(subject._id, subject.subject_name)}
                                disabled={isDeleting === subject._id}
                              >
                                {isDeleting === subject._id ? "Deleting..." : "Delete Subject"}
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
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {subjectsResponse?.status === "error"
                      ? `Failed to load subjects. ${subjectsResponse.error}`
                      : "No subjects found."}
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
