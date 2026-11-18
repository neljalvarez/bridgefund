"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, Compass, Menu, Moon, PlayCircle, Presentation, Sun } from "lucide-react";
import { JudgeMode } from "@/components/app/JudgeMode";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/shared/Logo";
import { useTheme } from "@/components/app/useTheme";
import { LanguageToggle } from "@/components/app/LanguageToggle";
import { cn } from "@/lib/utils";

export const COMPANY = [
  { href: "/simulator", label: "Rescue simulator", description: "Crowdfunding vs BridgeFund" },
  { href: "/business", label: "Business model", description: "How it pays for itself" },
  { href: "/scale", label: "UAE expansion", description: "Abu Dhabi first, then every emirate" },
  { href: "/pilot", label: "UAE pilot", description: "How we'll test it" },
];
export const MARKETING_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/impact", label: "Impact" },
  { href: "/why", label: "Why BridgeFund" },
];

function Menu2({ label, items }: { label: string; items: typeof COMPANY }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:text-foreground">
        {label} <ChevronDown className="h-3.5 w-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel className="text-xs text-muted-foreground">{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.map((i) => (
          <DropdownMenuItem key={i.href} asChild>
            <Link href={i.href} className="flex flex-col items-start gap-0">
              <span className="font-medium">{i.label}</span>
              <span className="text-xs text-muted-foreground">{i.description}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const { dark, toggle } = useTheme();
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center gap-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-5 text-sm text-muted-foreground lg:flex">
          {MARKETING_LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={pathname === l.href ? "page" : undefined} className={cn("transition-colors hover:text-foreground", pathname === l.href && "font-medium text-foreground")}>
              {l.label}
            </Link>
          ))}
          <Menu2 label="More" items={COMPANY} />
        </nav>
        <div className="ms-auto flex items-center gap-2">
          <LanguageToggle className="hidden lg:inline-flex" />
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex" onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
            {dark ? <Sun /> : <Moon />}
          </Button>
          <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
            <Link href="/signin">Sign In</Link>
          </Button>
          <JudgeMode>
            <Button size="sm" aria-label="Judge mode">
              <Compass /> <span className="hidden sm:inline">Judge mode</span>
            </Button>
          </JudgeMode>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu />
          </Button>
        </div>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="overflow-y-auto">
          <SheetTitle>Menu</SheetTitle>
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {[...MARKETING_LINKS, ...COMPANY].map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-md px-2 py-2 text-sm hover:bg-muted">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto grid gap-2">
            <Button asChild variant="outline">
              <Link href="/present" onClick={() => setOpen(false)}>
                <Presentation /> Presentation mode
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/signin">Sign In</Link>
            </Button>
            <Button asChild variant="soft">
              <Link href="/demo">
                <PlayCircle /> Launch Interactive Demo
              </Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
