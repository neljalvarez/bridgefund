"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Moon, PlayCircle, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "@/components/shared/Logo";
import { useTheme } from "@/components/app/useTheme";

export const MARKETING_LINKS = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#students", label: "For Students" },
  { href: "/#sponsors", label: "For Sponsors" },
  { href: "/#institutions", label: "For Institutions" },
  { href: "/#impact", label: "Our Impact" },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const { dark, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center gap-6">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-6 text-sm text-muted-foreground lg:flex">
          {MARKETING_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
            {dark ? <Sun /> : <Moon />}
          </Button>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/signin">Sign In</Link>
          </Button>
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/signin?start=1">Get Started</Link>
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu />
          </Button>
        </div>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right">
          <SheetTitle>Menu</SheetTitle>
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {MARKETING_LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-md px-2 py-2 text-sm hover:bg-muted">
                {l.label}
              </Link>
            ))}
            <Link href="/business" onClick={() => setOpen(false)} className="rounded-md px-2 py-2 text-sm hover:bg-muted">
              Business model
            </Link>
          </nav>
          <div className="mt-auto grid gap-2">
            <Button asChild variant="outline">
              <Link href="/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/signin?start=1">Get Started</Link>
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
