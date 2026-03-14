"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash } from "lucide-react";
import { EditMarkDialog } from "./EditMarkDialog";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { Doc, Id } from "@/convex/_generated/dataModel";

// Enriched row shape after joining marks with student/exam/subject data
export type MarksRowData = Doc<"marks"> & {
  studentName: string;
  rollNo: string;
  examName: string;
  subjectName: string;
  maxMarks: number;
};

interface MarksSpreadsheetProps {
  marks: Doc<"marks">[];
  students: Doc<"students">[];
  exams: Doc<"exams">[];
  subjects: Doc<"subjects">[];
}

export function MarksSpreadsheet({ marks, students, exams, subjects }: MarksSpreadsheetProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [editingMark, setEditingMark] = useState<MarksRowData | null>(null);
  const { isTeacher } = useAuthCheck();

  const tableData = React.useMemo<MarksRowData[]>(() => {
    return marks.map((m) => {
      const student = students.find((s) => s._id === m.student);
      const exam = exams.find((e) => e._id === m.exam);
      const subject = subjects.find((s) => s._id === m.subject);
      return {
        ...m,
        studentName: student?.name ?? "Unknown",
        rollNo: student?.roll_no ?? "N/A",
        examName: exam?.name ?? "N/A",
        subjectName: subject?.subject_name ?? "N/A",
        maxMarks: exam?.max_marks ?? 0,
      };
    });
  }, [marks, students, exams, subjects]);

  const columns = React.useMemo<ColumnDef<MarksRowData>[]>(
    () => [
      {
        accessorKey: "rollNo",
        header: "Roll No",
        size: 100,
      },
      {
        accessorKey: "studentName",
        header: "Name",
        size: 250,
      },
      {
        accessorKey: "subjectName",
        header: "Subject",
        size: 200,
      },
      {
        accessorKey: "examName",
        header: "Exam",
        size: 150,
      },
      {
        accessorKey: "marks",
        header: "Score",
        size: 120,
        cell: ({ row }) => {
          const mark = row.original;
          const percentage = (mark.marks / mark.maxMarks) * 100;
          
          let textColor = "text-foreground";
          if (percentage >= 75) textColor = "text-emerald-600 font-semibold";
          else if (percentage >= 40) textColor = "text-amber-600 font-semibold";
          else textColor = "text-rose-600 font-semibold";

          return (
            <div className={`flex items-center gap-1 ${textColor}`}>
              <span>{mark.marks}</span>
              <span className="text-xs text-muted-foreground">/ {mark.maxMarks}</span>
            </div>
          );
        },
      },
      {
        id: "percentage",
        header: "Percentage",
        size: 100,
        cell: ({ row }) => {
          const mark = row.original;
          const percentage = (mark.marks / mark.maxMarks) * 100;
          return `${percentage.toFixed(1)}%`;
        },
      },
      {
        id: "actions",
        header: "Actions",
        size: 80,
        cell: ({ row }) => (
          <div className="flex flex-row items-center gap-2">
          
          <Button
            variant="ghost"
            size="icon"
            className="size-8 hover:bg-sky-500/10 hover:text-sky-500"
            onClick={() => setEditingMark(row.original)}
          >
            <Edit2 className="size-4" />
          </Button>
          
          {
            !isTeacher && 
              <Button
                variant="ghost"
                size="icon"
                className="size-8 hover:bg-sky-500/10 hover:text-sky-500"
                >
                  <Trash className="size-4 text-red-500" />
              </Button>
          }
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48,
    overscan: 15,
  });

  return (
    <div className="rounded-md border bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col h-[600px]">
      <div ref={tableContainerRef} className="overflow-auto flex-1 scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40">
        <Table className="border-collapse table-fixed w-full">
          <TableHeader className="sticky top-0 bg-background z-20 shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="flex w-full border-none">
                {headerGroup.headers.map((header) => (
                  <TableHead 
                    key={header.id} 
                    className="flex items-center"
                    style={{ 
                      width: header.column.columnDef.size || header.getSize(),
                      flex: header.column.columnDef.size ? "none" : "1 1 0%"
                    }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: "relative" }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <TableRow
                  key={row.id}
                  className="flex items-center w-full border-b hover:bg-muted/30"
                  style={{
                    position: "absolute",
                    top: 0,
                    transform: `translateY(${virtualRow.start}px)`,
                    height: `${virtualRow.size}px`,
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      style={{ 
                        width: cell.column.columnDef.size || cell.column.getSize(),
                        flex: cell.column.columnDef.size ? "none" : "1 1 0%"
                      }}
                      className="flex items-center"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <EditMarkDialog
        isOpen={!!editingMark}
        onOpenChange={(open) => !open && setEditingMark(null)}
        mark={editingMark}
      />
    </div>
  );
}
