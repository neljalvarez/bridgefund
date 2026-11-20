"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Building2, Compass, GraduationCap, HelpCircle, LogOut, Menu, Moon, PlayCircle, RotateCcw, Search, Settings, Sun } from "lucide-react";
import { OnboardingTour, startTour } from "./OnboardingTour";
import { TOUR_UI } from "@/lib/tour";
import { JudgeMode } from "./JudgeMode";
import type { Role } from "@/lib/types";
import { useStore } from "@/lib/store";
import { setInstitution, setRole } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/shared/Logo";
import { Lattice } from "@/components/shared/Motifs";
import { ACCOUNT_NAV, ROLE_META, ROLE_NAV } from "./nav";
import { RoleSwitcher } from "./RoleSwitcher";
import { CommandSearch } from "./CommandSearch";
import { NotificationCenter } from "./NotificationCenter";
import { useTheme } from "./useTheme";
import { t } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";
import { FeedbackButton } from "./FeedbackButton";
import { useT } from "@/lib/store";

function SidebarNav({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { state } = useStore();
  const unread = state.notifications.filter((n) => n.role === state.role && !n.read).length;
  const tr = (k: string) => t(state.display.locale, k);
  const link = (href: string, label: string, Icon: typeof Settings, root: boolean, badge?: number) => {
    const active = root ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
    return (
      <li key={href}>
        <Link
          href={href}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className={cn(
            "group relative flex items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-[14px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active ? "bg-card font-medium text-foreground before:absolute before:inset-y-1 before:start-0 before:w-[2px] before:bg-primary" : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
          )}
        >
          <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} strokeWidth={1.6} aria-hidden />
          {tr(label)}
          {!!badge && <span className="tabular ms-auto rounded-sm bg-primary px-1.5 text-[10px] font-medium text-primary-foreground">{badge}</span>}
        </Link>
      </li>
    );
  };
  return (
    <nav aria-label={`${ROLE_META[role].label} navigation`} className="flex flex-1 flex-col gap-4 overflow-y-auto">
      {ROLE_NAV[role].map((g) => (
        <div key={g.section}>
          <p className="eyebrow mb-1.5 px-2.5 text-muted-foreground">{tr(g.section)}</p>
          <ul className="space-y-0.5">{g.items.map((i) => link(i.href, i.label, i.icon, i.href === ROLE_META[role].home))}</ul>
        </div>
      ))}
      <div className="mt-auto">
        <p className="eyebrow mb-1.5 px-2.5 text-muted-foreground">{tr("Account")}</p>
        <ul className="space-y-0.5">{ACCOUNT_NAV.map((i) => link(i.href, i.label, i.icon, false, i.href === "/notifications" ? unread : undefined))}</ul>
      </div>
    </nav>
  );
}

function InstitutionPicker() {
  const { state, dispatch } = useStore();
  return (
    <div className="rounded-md border bg-card p-2.5">
      <p className="eyebrow mb-1.5 flex items-center gap-1.5 text-muted-foreground">
        <Building2 className="h-3 w-3" /> Signed in as
      </p>
      <Select value={state.currentInstitutionId} onValueChange={(v) => dispatch(setInstitution(v), { info: v === "all" ? "Viewing the whole partner network" : `Switched to ${state.institutions.find((i) => i.id === v)?.name}` })}>
        <SelectTrigger className="h-8 text-xs" aria-label="Institution account">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Partner network admin</SelectItem>
          {state.institutions.map((i) => (
            <SelectItem key={i.id} value={i.id}>
              {i.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SidebarBody({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-5">
      <Logo href="/" className="px-1.5" />
      {role === "institution" && <InstitutionPicker />}
      <SidebarNav role={role} onNavigate={onNavigate} />
      <div className="overflow-hidden rounded-md border text-xs text-muted-foreground">
        <div className="relative h-5 border-b text-border" aria-hidden>
          <Lattice size={20} />
        </div>
        <div className="p-3">
          <p className="eyebrow text-foreground">Demonstration</p>
          <p className="mt-1">All people, organisations and transactions are fictional. No real money moves.</p>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, dispatch, reset } = useStore();
  const tr = useT();
  const { dark, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const areaRole = (["student", "sponsor", "institution"] as Role[]).find((r) => pathname.startsWith(`/${r}`));
  const role = areaRole ?? state.role;

  useEffect(() => {
    if (areaRole && areaRole !== state.role) dispatch(setRole(areaRole));
  }, [areaRole, state.role, dispatch]);

  const meta = ROLE_META[role];
  const persona = role === "sponsor" ? state.sponsors.find((s) => s.id === state.currentSponsorId)?.name ?? meta.persona : role === "student" ? state.profile.displayName : meta.persona;

  return (
    <div className="min-h-screen bg-background">
      <aside className="no-print fixed inset-y-0 start-0 z-30 hidden w-64 border-e bg-background px-3 py-5 lg:block">
        <SidebarBody role={role} />
      </aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="mb-2">
            <RoleSwitcher stacked onSwitch={() => setMobileOpen(false)} />
          </div>
          <SidebarBody role={role} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="lg:ps-64 print:ps-0">
        <header className="no-print sticky top-0 z-20 border-b bg-background">
          <div className="flex h-14 items-center gap-2 px-4 md:px-6">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
              <Menu />
            </Button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-full max-w-sm items-center gap-2 rounded-md border bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Search className="h-4 w-4" aria-hidden />
              <span className="truncate">{tr("Search…")}</span>
              <kbd className="ms-auto hidden rounded-sm border px-1.5 font-mono text-[10px] sm:inline">⌘K</kbd>
            </button>
            <div className="ms-auto flex items-center gap-1.5">
              <RoleSwitcher className="hidden md:flex" />
              <JudgeMode>
                <Button size="sm" className="ms-1" aria-label={tr("Judge mode")}>
                  <Compass /> <span className="hidden sm:inline">{tr("Judge mode")}</span>
                </Button>
              </JudgeMode>
              <LanguageToggle className="hidden xl:inline-flex" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={tr("Help")} title={tr("Help")}>
                    <HelpCircle />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>{tr("Help")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      startTour(role);
                      router.push(ROLE_META[role].home);
                    }}
                  >
                    <GraduationCap /> {TOUR_UI.restart[state.display.locale]} · {TOUR_UI.roles[role][state.display.locale]}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/demo")}>
                    <PlayCircle /> {tr("Watch the 90-second demo")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <FeedbackButton />
              <Button variant="ghost" size="icon" className="hidden sm:inline-flex" onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
                {dark ? <Sun /> : <Moon />}
              </Button>
              <NotificationCenter />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Account menu">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{persona.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                  <DropdownMenuLabel>
                    <span className="block text-sm font-medium text-foreground">{persona}</span>
                    <span className="block font-normal">{meta.label} · demo account</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => router.push("/settings")}>
                    <Settings /> Profile settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/demo")}>
                    <PlayCircle /> Launch interactive demo
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      reset();
                      router.push(ROLE_META[role].home);
                    }}
                  >
                    <RotateCcw /> Reset demo data
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => router.push("/")}>
                    <LogOut /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main id="main" className="mx-auto w-full max-w-[1240px] px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>
      </div>

      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <OnboardingTour />
    </div>
  );
}

export function ShellSkeleton() {
  return (
    <div className="min-h-screen bg-background" aria-busy="true" aria-label="Loading">
      <aside className="fixed inset-y-0 start-0 hidden w-64 border-e bg-card/60 px-4 py-5 lg:block">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-8 space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-7 animate-pulse rounded-md bg-muted/70" />
          ))}
        </div>
      </aside>
      <div className="lg:ps-64">
        <div className="h-14 border-b" />
        <div className="mx-auto max-w-[1240px] space-y-6 px-6 py-8">
          <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/70" />
            ))}
          </div>
          <div className="h-72 animate-pulse rounded-xl bg-muted/60" />
        </div>
      </div>
    </div>
  );
}
