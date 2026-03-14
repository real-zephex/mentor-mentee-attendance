"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Marks } from "@/convex/types";
import { useAuthCheck } from "@/hooks/useAuthCheck";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
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
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, PlusIcon } from "lucide-react";

// Dashboard Components
import { FilterBar } from "./dashboard/FilterBar";
import { StatsCards } from "./dashboard/StatsCards";
import { MarksSpreadsheet } from "./dashboard/MarksSpreadsheet";

const MarksManagement = () => {
  const { user, isTeacher } = useAuthCheck();

  // Tab State
  const [activeTab, setActiveTab] = useState<"dashboard" | "add">("dashboard");

  // Dashboard Filters State
  const [dashboardFilters, setDashboardFilters] = useState({
    subject: null as Id<"subjects"> | null,
    exam: null as Id<"exams"> | null,
    semester: null as Id<"semesters"> | null,
    class: null as Id<"classes"> | null,
    searchTerm: "",
  });

  // Add Marks Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmCountdown, setConfirmCountdown] = useState(3);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [addSelectedSemester, setAddSelectedSemester] = useState<Id<"semesters"> | null>(null);
  const [addSelectedClass, setAddSelectedClass] = useState<Id<"classes"> | null>(null);
  const [addSelectedSubject, setAddSelectedSubject] = useState<Id<"subjects"> | null>(null);
  const [addSelectedExam, setAddSelectedExam] = useState<Id<"exams"> | null>(null);

  // Queries
  const allSemesters = useQuery(api.functions.semesters_queries.getAllSemesters);
  const allClasses = useQuery(api.functions.classes_queries.GetAllClasses);
  const allExams = useQuery(api.functions.exams_queries.GetAllExams);
  const allSubjectsQuery = useQuery(api.functions.subjects_queries.GetAllSubjects); // should log error if in teacher mode: INTENDED BEHAVIOUR 
  
  const teacherSubjects = useQuery(
    api.functions.subjects_queries.GetTeacherSubjects,
    isTeacher && user ? { teacherId: user._id } : "skip"
  );
  
  const subjects = isTeacher ? teacherSubjects : allSubjectsQuery;

  // Optimized Dashboard Data Fetching
  const marksResponse = useQuery(
    api.functions.marks_queries.GetMarksByFilters,
    {
      subject_id: dashboardFilters.subject ?? undefined,
      exam_id: dashboardFilters.exam ?? undefined,
      semester_id: dashboardFilters.semester ?? undefined,
      class_id: dashboardFilters.class ?? undefined,
    }
  );

  const studentsByClass = useQuery(
    api.functions.students_queries.getAllStudentsByClass,
    addSelectedClass ? { class: addSelectedClass } : "skip"
  );

  const allStudents = useQuery(api.functions.students_queries.getAllStudents);

  const batchInsertMarks = useMutation(api.functions.marks_actions.BatchMarksInsert);

  const [addStudentsData, setAddStudentsData] = useState<Marks[]>([]);

  // Add Marks Dialog Logic
  useEffect(() => {
    if (
      !studentsByClass ||
      studentsByClass.status === "error" ||
      !addSelectedSemester ||
      !addSelectedExam ||
      !addSelectedSubject ||
      !addSelectedClass
    ) {
      setAddStudentsData([]);
      return;
    }

    const newSet = studentsByClass.data.map((i) => ({
      student: i._id,
      semester: addSelectedSemester,
      marks: 0,
      subject: addSelectedSubject,
      exam: addSelectedExam,
      class: addSelectedClass,
    }));
    setAddStudentsData(newSet);
  }, [studentsByClass, addSelectedSemester, addSelectedExam, addSelectedSubject, addSelectedClass]);

  const addSelectedExamData = useMemo(() => {
    if (allExams?.status !== "success") return undefined;
    return allExams.data.find((e) => e._id === addSelectedExam);
  }, [allExams, addSelectedExam]);

  const setAddMarks = useCallback(
    (student_id: Id<"students">, marks: number) => {
      if (addSelectedExamData && marks > addSelectedExamData.max_marks) {
        toast.error(`Marks cannot exceed ${addSelectedExamData.max_marks}`);
        return;
      }
      setAddStudentsData((prev) =>
        prev.map((s) => (s.student === student_id ? { ...s, marks } : s)),
      );
    },
    [addSelectedExamData],
  );

  const resetAddForm = () => {
    setAddSelectedSemester(null);
    setAddSelectedClass(null);
    setAddSelectedSubject(null);
    setAddSelectedExam(null);
    setAddStudentsData([]);
  };

  const handleAddSaveMarks = () => {
    if (!addSelectedSemester || !addSelectedClass || !addSelectedSubject || !addSelectedExam) {
      toast.error("Please select semester, class, subject, and exam");
      return;
    }

    if (addStudentsData.length === 0) {
      toast.error("No students found for the selected class");
      return;
    }

    setConfirmCountdown(3);
    setIsConfirmOpen(true);
  };

  useEffect(() => {
    if (!isConfirmOpen) {
      if (countdownRef.current) clearInterval(countdownRef.current);
      return;
    }

    countdownRef.current = setInterval(() => {
      setConfirmCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isConfirmOpen]);

  const handleConfirmAddSave = async () => {
    setIsConfirmOpen(false);
    setIsSaving(true);
    try {
      await batchInsertMarks({ data: addStudentsData });
      toast.success("Marks saved successfully");
      resetAddForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to save marks:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save marks");
    } finally {
      setIsSaving(false);
    }
  };

  // Dashboard Data Processing
  const filteredMarks = useMemo(() => {
    if (!marksResponse || marksResponse.status !== "success" || !allStudents || allStudents.status !== "error" && !allStudents.data) return [];
    
    let result = marksResponse.data;

    if (dashboardFilters.searchTerm && allStudents?.status === "success") {
      const term = dashboardFilters.searchTerm.toLowerCase();
      result = result.filter(m => {
        const student = allStudents.data.find(s => s._id === m.student);
        return student?.name.toLowerCase().includes(term) || student?.roll_no.toLowerCase().includes(term);
      });
    }

    return result;
  }, [marksResponse, allStudents, dashboardFilters.searchTerm]);

  const subjectsData = subjects?.status === "success" ? subjects.data : [];
  const semestersData = allSemesters?.status === "success" ? allSemesters.data : [];
  const classesData = allClasses?.status === "success" ? allClasses.data : [];
  const examsData = allExams?.status === "success" ? allExams.data : [];

  const isLoading = 
    allSemesters === undefined || 
    allClasses === undefined || 
    allExams === undefined || 
    subjects === undefined ||
    allStudents === undefined;

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading marks data...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Marks Management</h2>
        <p className="text-muted-foreground text-sm">
          Track and analyze student academic performance.
        </p>
      </div>

      <StatsCards marks={filteredMarks} exams={examsData} />

      <Tabs defaultValue="dashboard" className="w-full space-y-6" onValueChange={(val) => setActiveTab(val as any)}>
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutGrid className="size-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>
          
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetAddForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-sky-500 hover:bg-sky-600">
                <PlusIcon className="mr-2 size-4" />
                Add Marks
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
              <DialogHeader className="shrink-0">
                <DialogTitle>Add New Marks</DialogTitle>
                <DialogDescription>
                  Enter bulk marks for a class by selecting the specific exam and subject.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 shrink-0 pt-1">
                <Select onValueChange={(e) => setAddSelectedSemester(e as Id<"semesters">)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semestersData.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        Semester {item.number} | {item.academic_year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select onValueChange={(e) => setAddSelectedClass(e as Id<"classes">)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classesData.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.class_year} | {item.class_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  disabled={!addSelectedSemester}
                  onValueChange={(e) => setAddSelectedSubject(e as Id<"subjects">)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectsData.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.subject_name} | {item.subject_code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  disabled={!addSelectedSemester}
                  onValueChange={(e) => setAddSelectedExam(e as Id<"exams">)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {examsData.map((i) => (
                      <SelectItem key={i._id} value={i._id}>
                        {i.name} | Max: {i.max_marks}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0 mt-4 border rounded-lg bg-background">
                {studentsByClass && studentsByClass.status === "success" && studentsByClass.data.length > 0 ? (
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                      <TableRow>
                        <TableHead className="w-[100px]">Roll No</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="w-[150px]">Marks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentsByClass.data.map((item) => (
                        <TableRow key={item._id}>
                          <TableCell className="font-medium">{item.roll_no}</TableCell>
                          <TableCell>{item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="0"
                                type="number"
                                className="h-8"
                                min={0}
                                max={addSelectedExamData?.max_marks}
                                onChange={(e) => setAddMarks(item._id, Number(e.target.value))}
                              />
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                / {addSelectedExamData?.max_marks ?? "?"}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                    {!addSelectedClass ? "Select a class to view students" : "No students found in this class"}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 shrink-0 pt-4 border-t mt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleAddSaveMarks} disabled={isSaving} className="bg-sky-500 hover:bg-sky-600">
                  {isSaving ? "Saving..." : "Save Marks"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <TabsContent value="dashboard" className="space-y-6 outline-none">
          <FilterBar
            filters={dashboardFilters}
            setFilters={setDashboardFilters}
            semesters={semestersData}
            classes={classesData}
            subjects={subjectsData}
            exams={examsData}
          />
          
          {marksResponse?.status === "success" ? (
            <MarksSpreadsheet
              marks={filteredMarks}
              students={allStudents?.status === "success" ? allStudents.data : []}
              exams={examsData}
              subjects={subjectsData}
            />
          ) : marksResponse?.status === "error" ? (
            <div className="p-12 text-center border-2 border-dashed rounded-xl">
              <p className="text-rose-500">Failed to load marks: {marksResponse.error}</p>
            </div>
          ) : (
            <div className="p-12 text-center">Loading dashboard...</div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={isConfirmOpen} onOpenChange={(open) => {
        setIsConfirmOpen(open);
        if (!open) setConfirmCountdown(3);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Marks Submission</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to save marks for {addStudentsData.length} students. 
              Please verify all entries before confirming.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAddSave} disabled={confirmCountdown > 0 || isSaving}>
              {confirmCountdown > 0 ? `Confirm (${confirmCountdown})` : "Confirm"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MarksManagement;
