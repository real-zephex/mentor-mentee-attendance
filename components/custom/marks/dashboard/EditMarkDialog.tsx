"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MarksRowData } from "./MarksSpreadsheet";

interface EditMarkDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mark: MarksRowData | null;
}

export function EditMarkDialog({ isOpen, onOpenChange, mark }: EditMarkDialogProps) {
  const [value, setValue] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const patchMarks = useMutation(api.functions.marks_actions.patchMarks);

  useEffect(() => {
    if (mark) {
      setValue(mark.marks);
    }
  }, [mark]);

  const handleSave = async () => {
    if (!mark) return;

    if (value > mark.maxMarks) {
      toast.error(`Marks cannot exceed ${mark.maxMarks}`);
      return;
    }

    if (value < 0) {
      toast.error("Marks cannot be negative");
      return;
    }

    setIsSaving(true);
    try {
      await patchMarks({ marks_id: mark._id, marks: value });
      toast.success("Marks updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update mark:", error);
      toast.error("Failed to update mark");
    } finally {
      setIsSaving(false);
    }
  };

  if (!mark) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Marks</DialogTitle>
          <DialogDescription>
            Update marks for {mark.studentName} in {mark.subjectName} ({mark.examName}).
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="marks" className="text-right">
              Marks
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                id="marks"
                type="number"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="flex-1"
                autoFocus
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                }}
              />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                / {mark.maxMarks}
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-sky-500 hover:bg-sky-600">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
