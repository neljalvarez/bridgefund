"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { BarChart3, Building2, Calculator, Compass, GraduationCap, HandCoins, Languages, PlayCircle, Presentation, RotateCcw, Sparkles, Ticket } from "lucide-react";
import type { Role } from "@/lib/types";
import { useMaybeStore } from "@/lib/store";
import { setDisplay, setRole } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const AREAS: { title: string; body: string; href: string; role?: Role; icon: typeof Compass; tag: string }[] = [
  { title: "BridgeEngine", body: "Costs in, savings found, gap closed.", href: "/student/engine", role: "student", icon: Sparkles, tag: "Student" },
  { title: "UAE opportunities", body: "Real competitions, aid and programmes.", href: "/student/waivers", role: "student", icon: Ticket, tag: "Student" },
  { title: "Student assistance", body: "Requests, deadlines and progress.", href: "/student", role: "student", icon: GraduationCap, tag: "Student" },
  { title: "Sponsor contributions", body: "Fund verified, anonymous needs.", href: "/sponsor/marketplace", role: "sponsor", icon: HandCoins, tag: "Sponsor" },
  { title: "Institution management", body: "Verify, approve, lend, track.", href: "/institution/requests", role: "institution", icon: Building2, tag: "School" },
  { title: "Impact analytics", body: "Results by emirate, from records.", href: "/impact", icon: BarChart3, tag: "Public" },
  { title: "Business model", body: "AED revenue and break-even simulator.", href: "/business#simulator", icon: Calculator, tag: "Public" },
];

/** One place for judges: guided demo, free exploration of every role, and an instant reset. No sign-in. */
export function JudgeMode({ children }: { children: ReactNode }) {
  const store = useMaybeStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const go = (href: string, role?: Role) => {
    if (role && store) store.dispatch(setRole(role));
    setOpen(false);
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-0">
        <DialogHeader className="border-b px-6 pb-4 pt-6 text-start">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Compass className="h-5 w-5 text-primary" aria-hidden /> Judge mode
          </DialogTitle>
          <DialogDescription>No sign-in. Switch roles instantly. Every figure is fictional and every payment simulated.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 px-6 pt-5 sm:grid-cols-2">
          <button type="button" onClick={() => go("/demo")} className="group flex items-center gap-3 rounded-xl bg-primary p-4 text-start text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <PlayCircle className="h-8 w-8 shrink-0" aria-hidden />
            <span>
              <span className="block font-medium">90-second demo</span>
              <span className="block text-sm text-primary-foreground/85">AED 450 → 0 across three roles</span>
            </span>
          </button>
          <button type="button" onClick={() => go("/present")} className="group flex items-center gap-3 rounded-xl border p-4 text-start transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Presentation className="h-8 w-8 shrink-0 text-primary" aria-hidden />
            <span>
              <span className="block font-medium">3-minute presentation</span>
              <span className="block text-sm text-muted-foreground">Problem to vision, full screen</span>
            </span>
          </button>
        </div>

        <p className="eyebrow px-6 pb-2 pt-6 text-muted-foreground">Explore freely</p>
        <ul className="grid grid-cols-1 gap-px overflow-hidden border-y bg-border sm:grid-cols-2">
          {AREAS.map((a) => (
            <li key={a.title} className="bg-card">
              <button type="button" onClick={() => go(a.href, a.role)} className="flex w-full items-start gap-3 px-6 py-3.5 text-start transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                  <a.icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-medium">{a.title}</span>
                    <span className="text-[11px] text-muted-foreground">{a.tag}</span>
                  </span>
                  <span className="block text-sm text-muted-foreground">{a.body}</span>
                </span>
              </button>
            </li>
          ))}
          {AREAS.length % 2 === 1 && <li className="hidden bg-card sm:block" aria-hidden />}
        </ul>

        <div className="flex flex-wrap items-center gap-2 px-6 py-4">
          <UtilityButton
            onClick={() => {
              store?.reset();
              setOpen(false);
            }}
            icon={RotateCcw}
          >
            Reset demo data
          </UtilityButton>
          <UtilityButton onClick={() => store?.dispatch(setDisplay({ locale: store.state.display.locale === "ar" ? "en" : "ar" }))} icon={Languages}>
            {store?.state.display.locale === "ar" ? "English" : "العربية"}
          </UtilityButton>
          <span className="ms-auto text-xs text-muted-foreground">Data stays in this browser</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UtilityButton({ onClick, icon: Icon, children }: { onClick: () => void; icon: typeof Compass; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cn("inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring")}>
      <Icon className="h-4 w-4" aria-hidden /> {children}
    </button>
  );
}
