"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FileText, LayoutGrid, Package, Store, Ticket } from "lucide-react";
import { useStore } from "@/lib/store";
import { WAIVERS } from "@/lib/knowledge";
import { aed } from "@/lib/format";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ACCOUNT_NAV, ROLE_NAV } from "./nav";

export function CommandSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { state } = useStore();
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };
  const pages = [...Object.values(ROLE_NAV).flatMap((g) => g.flatMap((x) => x.items)), ...ACCOUNT_NAV, { href: "/demo", label: "Launch interactive demo", icon: LayoutGrid, description: "Guided two-minute walkthrough" }, { href: "/business", label: "Business model", icon: LayoutGrid, description: "How BridgeFund sustains itself" },
    { href: "/present", label: "Presentation mode", icon: LayoutGrid, description: "Three-minute competition pitch" },
    { href: "/simulator", label: "Opportunity Rescue Simulator", icon: LayoutGrid, description: "Crowdfunding vs reduce-first" },
    { href: "/impact", label: "Social impact dashboard", icon: LayoutGrid, description: "Public demonstration metrics" },
    { href: "/why", label: "Why BridgeFund?", icon: LayoutGrid, description: "Comparison and research" },
    { href: "/scale", label: "Global scalability", icon: LayoutGrid, description: "Markets and expansion" },
    { href: "/pilot", label: "Pilot programme", icon: LayoutGrid, description: "Proposed pilot and results dashboard" },
  ];
  const needs = state.requests.filter((r) => ["Verified", "Partially Funded", "Fully Funded"].includes(r.status));
  const mine = state.requests.filter((r) => r.studentId === state.currentStudentId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-hidden p-0 [&>button]:hidden">
        <DialogTitle className="sr-only">Search BridgeFund</DialogTitle>
        <Command filter={(value, search) => (value.toLowerCase().includes(search.toLowerCase().trim()) ? 1 : 0)}>
          <CommandInput placeholder="Search pages, requests, waivers, resources…" autoFocus />
          <CommandList>
            <CommandEmpty>No results. Try “waiver”, “laptop” or a reference like BF-2041.</CommandEmpty>
            <CommandGroup heading="Pages">
              {pages.map((p) => (
                <CommandItem key={p.href + p.label} value={`page ${p.label} ${p.description}`} onSelect={() => go(p.href)}>
                  <p.icon />
                  <span>{p.label}</span>
                  <span className="ms-auto truncate text-xs text-muted-foreground">{p.description}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="My requests">
              {mine.map((r) => (
                <CommandItem key={r.id} value={`mine ${r.ref} ${r.purpose}`} onSelect={() => go("/student/requests")}>
                  <FileText />
                  <span>
                    {r.ref} · {r.purpose}
                  </span>
                  <span className="ms-auto text-xs text-muted-foreground">{r.status}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Verified needs">
              {needs.map((r) => (
                <CommandItem key={r.id} value={`need ${r.ref} ${r.purpose}`} onSelect={() => go(`/sponsor/marketplace/${r.id}`)}>
                  <Store />
                  <span>
                    {r.ref} · {r.purpose}
                  </span>
                  <span className="ms-auto text-xs text-muted-foreground tabular">{aed(Math.max(r.amount - r.funded, 0))} left</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Fee waivers">
              {WAIVERS.map((w) => (
                <CommandItem key={w.id} value={`waiver ${w.name} ${w.provider}`} onSelect={() => go(`/student/waivers?w=${w.id}`)}>
                  <Ticket />
                  <span>{w.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Resources">
              {state.resources.map((r) => (
                <CommandItem key={r.id} value={`resource ${r.name} ${r.type}`} onSelect={() => go(`/student/resources?r=${r.id}`)}>
                  <Package />
                  <span>{r.name}</span>
                  <span className="ms-auto text-xs text-muted-foreground">{r.available} available</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
