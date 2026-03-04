"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
  { href: "/dashboard/attendance", label: "Attendance", icon: <ClipboardCheck size={16} /> },
  { href: "/dashboard/students", label: "Students", icon: <Users size={16} /> },
  { href: "/dashboard/sessions", label: "Sessions", icon: <CalendarDays size={16} /> },
  { href: "/overview", label: "Overview", icon: <LayoutDashboard size={16} /> },
];

interface AppShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  showLogout?: boolean;
}

export function AppShell({
  title,
  description,
  children,
  actions,
  showLogout = true,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description ? (
              <p className="text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {actions}
            {showLogout ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut size={16} />
                Logout
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <nav className="border-b bg-background">
        <div className="mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto px-4 py-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted",
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
