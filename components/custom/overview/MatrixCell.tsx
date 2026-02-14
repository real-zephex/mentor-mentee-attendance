"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MatrixCellProps {
  status: "A" | "P" | "DL" | "UM" | null | string;
}

export function MatrixCell({ status }: MatrixCellProps) {
  if (!status || status === "UM") {
    return (
      <div className="flex items-center justify-center">
        <span className="text-muted-foreground/30">—</span>
      </div>
    );
  }

  const statusConfig = {
    P: {
      label: "P",
      className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    },
    A: {
      label: "A",
      className: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    },
    DL: {
      label: "DL",
      className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    className: "bg-muted text-muted-foreground",
  };

  return (
    <div className="flex items-center justify-center">
      <Badge
        variant="outline"
        className={cn(
          "h-6 w-6 p-0 flex items-center justify-center font-bold text-[10px]",
          config.className
        )}
      >
        {config.label}
      </Badge>
    </div>
  );
}
