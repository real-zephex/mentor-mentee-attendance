import { SubjectsPanel } from "@/components/custom/admin/SubjectsPanel";
import { UserVerificationPanel } from "@/components/custom/admin/UserVerificationPanel";

export default function AdminDashboardPage() {
  return (
    <main className="container mx-auto py-6 px-4 space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Verify users, link students, and manage subjects.
        </p>
      </div>

      <UserVerificationPanel />
      <SubjectsPanel />
    </main>
  );
}
