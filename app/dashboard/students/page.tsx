import NewStudent from "@/components/custom/studentForm";
import { AppShell } from "@/components/custom/AppShell";

export default function StudentsPage() {
  return (
    <AppShell
      title="Student Management"
      description="Register, edit, and remove student records."
    >
      <NewStudent />
    </AppShell>
  );
}
