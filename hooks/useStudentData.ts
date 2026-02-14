"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Doc } from "@/convex/_generated/dataModel";

export type StudentRecord = Doc<"students">;

type UseQueryResult<T> = {
  data: T;
  isLoading: boolean;
  error: string | null;
};

export const useStudentsByClass = (
  classId: Id<"classes"> | null,
): UseQueryResult<StudentRecord[]> => {
  const response = useQuery(
    api.functions.students_queries.getAllStudentsByClass,
    { class: classId || ("skip" as unknown as Id<"classes">) },
  );

  if (response === undefined) {
    return {
      data: [],
      isLoading: true,
      error: null,
    };
  }

  if (response.status === "error") {
    return {
      data: [],
      isLoading: false,
      error: response.error,
    };
  }

  return {
    data: response.data,
    isLoading: false,
    error: null,
  };
};
