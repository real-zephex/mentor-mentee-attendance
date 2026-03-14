"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw, Search } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface FilterBarProps {
  filters: {
    subject: Id<"subjects"> | null;
    exam: Id<"exams"> | null;
    semester: Id<"semesters"> | null;
    class: Id<"classes"> | null;
    searchTerm: string;
  };
  setFilters: (filters: any) => void;
  semesters: any[] | undefined;
  classes: any[] | undefined;
  subjects: any[] | undefined;
  exams: any[] | undefined;
}

export function FilterBar({ filters, setFilters, semesters, classes, subjects, exams }: FilterBarProps) {
  const resetFilters = () => {
    setFilters({
      subject: null,
      exam: null,
      semester: null,
      class: null,
      searchTerm: "",
    });
  };

  return (
    <div className="flex flex-wrap items-end gap-4 bg-muted/30 p-4 rounded-lg border border-border/50 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-1.5 min-w-[180px]">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Semester</label>
        <Select
          value={filters.semester ?? "all"}
          onValueChange={(val) => setFilters((prev: any) => ({ ...prev, semester: val === "all" ? null : val }))}
        >
          <SelectTrigger className="h-9 bg-background">
            <SelectValue placeholder="All Semesters" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Semesters</SelectItem>
            {semesters?.map((item) => (
              <SelectItem key={item._id} value={item._id}>
                Semester {item.number} | {item.academic_year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5 min-w-[180px]">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Class</label>
        <Select
          value={filters.class ?? "all"}
          onValueChange={(val) => setFilters((prev: any) => ({ ...prev, class: val === "all" ? null : val }))}
        >
          <SelectTrigger className="h-9 bg-background">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes?.map((item) => (
              <SelectItem key={item._id} value={item._id}>
                {item.class_year} | {item.class_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5 min-w-[200px]">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject</label>
        <Select
          value={filters.subject ?? "all"}
          onValueChange={(val) => setFilters((prev: any) => ({ ...prev, subject: val === "all" ? null : val }))}
        >
          <SelectTrigger className="h-9 bg-background">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects?.map((item) => (
              <SelectItem key={item._id} value={item._id}>
                {item.subject_name} | {item.subject_code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5 min-w-[180px]">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Exam</label>
        <Select
          value={filters.exam ?? "all"}
          onValueChange={(val) => setFilters((prev: any) => ({ ...prev, exam: val === "all" ? null : val }))}
        >
          <SelectTrigger className="h-9 bg-background">
            <SelectValue placeholder="All Exams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exams</SelectItem>
            {exams?.map((item) => (
              <SelectItem key={item._id} value={item._id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Search</label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or roll number..."
            className="h-9 pl-8 bg-background"
            value={filters.searchTerm}
            onChange={(e) => setFilters((prev: any) => ({ ...prev, searchTerm: e.target.value }))}
          />
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="h-9 text-muted-foreground hover:text-foreground shrink-0"
        onClick={resetFilters}
      >
        <RotateCcw className="mr-2 size-4" />
        Reset
      </Button>
    </div>
  );
}
