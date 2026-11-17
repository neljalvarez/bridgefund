"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { WAIVERS } from "@/lib/knowledge";
import { ROLE_NAV } from "./nav";
import { usd } from "@/lib/format";

interface Item {
  id: string;
  group: string;
  title: string;
  subtitle: string;
  href: string;
}

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useStore();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = useMemo<Item[]>(() => {
    const pages: Item[] = [
      { id: "p-home", group: "Pages", title: "Home", subtitle: "Landing page", href: "/" },
      { id: "p-demo", group: "Pages", title: "Judge demo mode", subtitle: "Guided two-minute walkthrough", href: "/demo" },
      { id: "p-biz", group: "Pages", title: "Business model", subtitle: "How BridgeFund sustains itself", href: "/business" },
      ...Object.values(ROLE_NAV)
        .flat()
        .map((n) => ({ id: `p-${n.href}`, group: "Pages", title: n.label, subtitle: n.description, href: n.href })),
    ];
    const opps = state.opportunities
      .filter((o) => o.studentId === state.currentStudentId)
      .map((o) => ({ id: o.id, group: "My opportunities", title: o.title, subtitle: o.provider, href: `/student/engine?opp=${o.id}` }));
    const reqs = state.requests.map((r) => ({
      id: r.id,
      group: "Requests",
      title: `${r.ref} · ${r.purpose}`,
      subtitle: `${r.status} · ${usd(r.amount)}`,
      href: state.role === "institution" ? `/institution?focus=${r.id}` : r.studentId === state.currentStudentId ? "/student/requests" : `/sponsor?focus=${r.id}`,
    }));
    const waivers = WAIVERS.map((w) => ({ id: w.id, group: "Fee waivers", title: w.name, subtitle: w.provider, href: `/student/waivers?w=${w.id}` }));
    const res = state.resources.map((r) => ({ id: r.id, group: "Resources", title: r.name, subtitle: `${r.available} available`, href: `/student/resources?r=${r.id}` }));
    return [...pages, ...opps, ...reqs, ...waivers, ...res];
  }, [state]);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items.filter((i) => i.group === "Pages").slice(0, 9);
    return items.filter((i) => `${i.title} ${i.subtitle} ${i.group}`.toLowerCase().includes(t)).slice(0, 14);
  }, [q, items]);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  useEffect(() => setActive(0), [q]);

  const go = (i: Item) => {
    onClose();
    router.push(i.href);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[75] flex items-start justify-center p-4 pt-[12vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-[#232824]/50" onClick={onClose} aria-hidden />
          <motion.div role="dialog" aria-modal="true" aria-label="Search BridgeFund" className="panel relative w-full max-w-xl" initial={{ y: -10 }} animate={{ y: 0 }}>
            <div className="flex items-center gap-2 border-b-2 border-line px-3">
              <Search size={16} className="text-muted" aria-hidden />
              <input
                ref={inputRef}
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") onClose();
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((a) => Math.min(a + 1, results.length - 1));
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((a) => Math.max(a - 1, 0));
                  }
                  if (e.key === "Enter" && results[active]) go(results[active]);
                }}
                placeholder="Search pages, waivers, resources, requests…"
                className="h-12 flex-1 bg-transparent text-sm outline-none focus-visible:outline-none"
                role="combobox"
                aria-expanded="true"
                aria-controls="search-results"
                aria-activedescendant={results[active] ? `sr-${results[active].id}` : undefined}
              />
              <kbd className="border border-line/40 px-1 font-mono text-[10px] text-muted">ESC</kbd>
            </div>
            <ul id="search-results" role="listbox" className="scrollbar-thin max-h-[50vh] overflow-y-auto p-1">
              {results.length === 0 && <li className="p-6 text-center text-sm text-muted">No matches for “{q}”. Try “waiver”, “laptop” or a request reference like BF-2041.</li>}
              {results.map((r, i) => (
                <li
                  key={r.id}
                  id={`sr-${r.id}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(r)}
                  className={`flex cursor-pointer items-center gap-3 px-3 py-2 ${i === active ? "bg-forest text-onforest" : ""}`}
                >
                  <span className={`w-24 shrink-0 text-[10px] font-semibold uppercase tracking-wider ${i === active ? "opacity-80" : "text-muted"}`}>{r.group}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{r.title}</span>
                    <span className={`block truncate text-xs ${i === active ? "opacity-80" : "text-muted"}`}>{r.subtitle}</span>
                  </span>
                  {i === active && <ArrowRight size={14} aria-hidden />}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
