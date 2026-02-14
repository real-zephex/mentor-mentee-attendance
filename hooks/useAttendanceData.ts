"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Doc } from "@/convex/_generated/dataModel";

export type AttendanceRecord = Doc<"attendance">;

type UseQueryResult<T> = {
  data: T;
  isLoading: boolean;
  error: string | null;
};

/**
 * Unwraps Convex query response and provides clean data/error handling
 * Converts ReturnProps<T> to UseQueryResult<T>
 */
export const useAttendanceBySession = (
  sessionId: Id<"sessions"> | null
): UseQueryResult<AttendanceRecord[]> => {
  const response = useQuery(
    api.functions.attendance_queries.GetAttendanceBySession,
    { session: sessionId || ("skip" as unknown as Id<"sessions">) }
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
