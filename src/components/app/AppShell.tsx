"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Building2, LogOut, Menu, Moon, PlayCircle, RotateCcw, Search, Settings, Sun } from "lucide-react";
import type { Role } from "@/lib/types";
import { useStore } from "@/lib/store";
import { setInstitution, setRole } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/shared/Logo";
import { ACCOUNT_NAV, ROLE_META, ROLE_NAV } from "./nav";
import { RoleSwitcher } from "./RoleSwitcher";
import { CommandSearch } from "./CommandSearch";
import { NotificationCenter } from "./NotificationCenter";
import { useTheme } from "./useTheme";
import { t } from "@/lib/i18n";

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
            "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active ? "bg-primary-light text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} aria-hidden />
          {tr(label)}
          {!!badge && <span className="ml-auto rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">{badge}</span>}
        </Link>
      </li>
    );
  };
  return (
    <nav aria-label={`${ROLE_META[role].label} navigation`} className="flex flex-1 flex-col gap-5 overflow-y-auto">
      {ROLE_NAV[role].map((g) => (
        <div key={g.section}>
          <p className="mb-1.5 px-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">{tr(g.section)}</p>
          <ul className="space-y-0.5">{g.items.map((i) => link(i.href, i.label, i.icon, i.href === ROLE_META[role].home))}</ul>
        </div>
      ))}
      <div className="mt-auto">
        <p className="mb-1.5 px-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/80">{tr("Account")}</p>
        <ul className="space-y-0.5">{ACCOUNT_NAV.map((i) => link(i.href, i.label, i.icon, false, i.href === "/notifications" ? unread : undefined))}</ul>
      </div>
    </nav>
  );
}

function InstitutionPicker() {
  const { state, dispatch } = useStore();
  return (
    <div className="rounded-lg border bg-card p-2.5">
      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
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
      <div className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Demonstration environment</p>
        <p className="mt-0.5">All people, organisations and transactions are fictional. No real money moves.</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, dispatch, reset } = useStore();
  const { dark, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const areaRole = (["student", "sponsor", "institution"] as Role[]).find((r) => pathname.startsWith(`/${r}`));
  const role = areaRole ?? state.role;

  useEffect(() => {
    if (areaRole && areaRole !== state.role) dispatch(setRole(areaRole));
  }, [areaRole, state.role, dispatch]);

  const meta = ROLE_META[role];
  const persona = role === "sponsor" ? state.sponsors.find((s) => s.id === state.currentSponsorId)?.name ?? meta.persona : role === "student" ? state.profile.displayName : meta.persona;

  return (
    <div className="min-h-screen bg-background">
      <aside className="no-print fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-card/60 px-3 py-5 lg:block">
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

      <div className="lg:pl-64 print:pl-0">
        <header className="no-print sticky top-0 z-20 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <div className="flex h-14 items-center gap-2 px-4 md:px-6">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
              <Menu />
            </Button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-full max-w-sm items-center gap-2 rounded-md border bg-card px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Search className="h-4 w-4" aria-hidden />
              <span className="truncate">Search…</span>
              <kbd className="ml-auto hidden rounded border bg-muted px-1.5 font-mono text-[10px] sm:inline">⌘K</kbd>
            </button>
            <div className="ml-auto flex items-center gap-1.5">
              <RoleSwitcher className="hidden md:flex" />
              <Button asChild size="sm" className="ml-1 hidden sm:inline-flex">
                <Link href="/demo">
                  <PlayCircle /> Launch Interactive Demo
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
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
                  <DropdownMenuItem onSelect={() => setResetOpen(true)}>
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
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset demo data?</DialogTitle>
            <DialogDescription>Every student, request, balance and reservation returns to its starting point. Your profile preferences are kept.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                reset();
                setResetOpen(false);
                router.push(ROLE_META[role].home);
              }}
            >
              <RotateCcw /> Reset demo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ShellSkeleton() {
  return (
    <div className="min-h-screen bg-background" aria-busy="true" aria-label="Loading">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-card/60 px-4 py-5 lg:block">
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
      <div className="lg:pl-64">
        <div className="h-14 border-b" />
        <div className="mx-auto max-w-[1240px] space-y-6 px-6 py-8">
          <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
