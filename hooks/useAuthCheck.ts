"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export const useAuthCheck = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const currentUser = useQuery(api.functions.helper.getCurrentUser);

  const isConfirmed = currentUser?.status === "active";
  const isAdmin = currentUser?.role === "admin";
  const isViewer = isConfirmed && !isAdmin;

  return {
    isLoading: !isLoaded || currentUser === undefined,
    isSignedIn,
    isConfirmed,
    isAdmin,
    isViewer,
    user: currentUser,
  };
};
