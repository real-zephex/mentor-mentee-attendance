import NewSessionForm from "@/components/custom/sessionForm";
import { AppShell } from "@/components/custom/AppShell";

export default function SessionsPage() {
  return (
    <AppShell
      title="Session Management"
      description="Create and maintain mentoring sessions."
    >
      <NewSessionForm />
    </AppShell>
  );
}
