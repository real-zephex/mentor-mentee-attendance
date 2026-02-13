"use client";

import UserAccount from "@/components/custom/accounts";
import NotAuthorized from "@/components/custom/notAuthorized";
import { Spinner } from "@/components/ui/spinner";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { ReactNode, useEffect } from "react";

const AuthValidator = ({ children }: { children: ReactNode }) => {
  const { isLoading, isSignedIn, isConfirmed, isAdmin, isViewer, user } =
    useAuthCheck();

  useEffect(() => {
    console.log(`Welcome ${user?.name} to the system `);
  }, [user]);

  if (isLoading) {
    <div className="h-dvh w-dvw flex flex-row items-center justify-center gap-2">
      <Spinner />
      Loading
    </div>;
  }

  if (!isSignedIn) {
    return <UserAccount />;
  }

  if (!isConfirmed || !isAdmin || isViewer) {
    return <NotAuthorized />;
  }

  return <main>{children}</main>;
};

export default AuthValidator;
