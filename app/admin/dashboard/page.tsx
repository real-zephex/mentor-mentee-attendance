import { ExamsPanel } from "@/components/custom/admin/ExamsPanel";
import { SubjectsPanel } from "@/components/custom/admin/SubjectsPanel";
import { SemestersPanel } from "@/components/custom/admin/SemestersPanel";
import { UserVerificationPanel } from "@/components/custom/admin/UserVerificationPanel";

export default function AdminDashboardPage() {
  return (
    <main className="container mx-auto py-6 px-4 space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Verify users, manage semesters, and keep subjects organized.
        </p>
      </div>

      <UserVerificationPanel />

      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">Academic Actions</h2>
        <p className="text-muted-foreground">
          Manage semesters first, then assign subjects to them.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SemestersPanel />
        <SubjectsPanel />
      </div>
      <ExamsPanel />
    </main>
  );
}
