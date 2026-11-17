import { Hydrated } from "@/lib/store";
import { AppShell, ShellSkeleton } from "@/components/app/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Hydrated fallback={<ShellSkeleton />}>
      <AppShell>{children}</AppShell>
    </Hydrated>
  );
}
