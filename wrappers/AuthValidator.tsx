"use client";

import UserAccount from "@/components/custom/accounts";
import NotAuthorized from "@/components/custom/notAuthorized";
import { Spinner } from "@/components/ui/spinner";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { ReactNode } from "react";

const AuthValidator = ({ children }: { children: ReactNode }) => {
  const { isLoading, isSignedIn, isConfirmed, isAdmin, isViewer } =
    useAuthCheck();

  if (isLoading) {
    return (
      <div className="h-dvh w-dvw flex flex-row items-center justify-center gap-2">
        <Spinner />
        Loading
      </div>
    );
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
