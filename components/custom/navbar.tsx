"use client";

import { useAuthCheck } from "@/hooks/useAuthCheck";
import { UserButton } from "@clerk/nextjs";
import { Badge } from "../ui/badge";

import { ModeToggle } from "../theme-toggle";

const Navbar = () => {
  const { user } = useAuthCheck();

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-sky-500 flex items-center justify-center">
            <span className="text-white font-bold">A</span>
          </div>
          <h2 className="font-bold text-xl tracking-tight hidden sm:block">Attendance Tracker</h2>
        </div>
        <div className="flex flex-row items-center justify-center gap-3">
          {user && (
            <Badge
              variant="secondary"
              className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-500 border-sky-500/20"
            >
              {user.role.toUpperCase()}
            </Badge>
          )}
          <ModeToggle />
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "size-9 border-2 border-background shadow-sm"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
