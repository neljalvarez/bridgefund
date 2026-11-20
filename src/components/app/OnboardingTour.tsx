"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Check, Compass, HandCoins, PlayCircle, X } from "lucide-react";
import type { Role } from "@/lib/types";
import { useStore } from "@/lib/store";
import { remainingOf } from "@/lib/actions";
import { aed } from "@/lib/format";
import { cn } from "@/lib/utils";
import { fill, readTour, resolveRoute, TOUR_UI, TOURS, writeTour, type TourStore } from "@/lib/tour";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { AnimatedNumber } from "@/components/shared/kit";
import { LogoMark } from "@/components/shared/Logo";
import { ROLE_META } from "./nav";

const EVENT = "bridgefund-tour-change";
const PAD = 8; // space between the element and the spotlight edge
const HEADER = 72; // keep spotlights clear of the sticky header

/** Start (or restart) a role's tour from anywhere — Help menu, Settings. */
export function startTour(role: Role) {
  const t = readTour();
  writeTour({ ...t, active: { role, step: 0 } });
  window.dispatchEvent(new Event(EVENT));
}

type Rect = { top: number; left: number; width: number; height: number };

const roleOfPath = (p: string): Role | null => (["student", "sponsor", "institution"] as Role[]).find((r) => p === `/${r}` || p.startsWith(`/${r}/`)) ?? null;

export function OnboardingTour() {
  const { state } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const locale = state.display.locale;
  const L = useCallback((t: { en: string; ar: string }) => t[locale], [locale]);
  const [store, setStore] = useState<TourStore | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [missing, setMissing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const targetRef = useRef<HTMLElement | null>(null);
  const routeRef = useRef<string | null>(null);
  const navigating = useRef(false);
  const tipRef = useRef<HTMLDivElement>(null);

  // Tour progress lives in its own localStorage key, separate from demo data.
  useEffect(() => {
    setMounted(true);
    const sync = () => setStore(readTour());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const save = useCallback((next: TourStore) => {
    writeTour(next);
    setStore(next);
  }, []);

  const active = store?.active ?? null;
  const tour = active ? TOURS[active.role] : null;
  const step = tour && active ? tour.steps[Math.min(active.step, tour.steps.length - 1)] : null;
  const total = tour?.steps.length ?? 0;

  // Route of the current step, fixed when the step starts (so data changes can't move it).
  const route = useMemo(() => {
    if (!step) return null;
    const r = resolveRoute(step, state);
    routeRef.current = r;
    return r;
  }, [step?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = useCallback(
    (i: number) => {
      if (!store?.active) return;
      const t = TOURS[store.active.role];
      const n = Math.max(0, Math.min(t.steps.length - 1, i));
      const target = resolveRoute(t.steps[n], state);
      targetRef.current = null;
      setRect(null);
      setMissing(false);
      save({ ...store, active: { role: store.active.role, step: n } });
      if (target !== pathname) {
        navigating.current = true;
        router.push(target);
      }
    },
    [pathname, router, save, state, store],
  );

  const end = useCallback(
    (status: "completed" | "skipped") => {
      if (!store?.active) return;
      save({ done: { ...store.done, [store.active.role]: status }, active: null });
      setRect(null);
      targetRef.current = null;
    },
    [save, store],
  );

  // Navigation for a step has finished once we're on its page.
  useEffect(() => {
    if (route && pathname === route) navigating.current = false;
  }, [pathname, route]);

  // Find the element for this step, scroll it into view, then follow it as the page moves.
  useEffect(() => {
    if (!step || !route || pathname !== route) return;
    let cancelled = false;
    let tries = 0;
    targetRef.current = null;
    setRect(null);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const find = () => {
      if (cancelled) return;
      // Selectors are tried in order, so a step can fall back (e.g. to an empty state).
      const el = step.target
        .split(",")
        .map((sel) => document.querySelector<HTMLElement>(sel.trim()))
        .find(Boolean);
      if (!el) {
        if (++tries < 40) window.setTimeout(find, 100);
        else setMissing(true);
        return;
      }
      targetRef.current = el;
      setMissing(false);
      const r = el.getBoundingClientRect();
      const mobile = window.innerWidth < 640;
      const bottomReserve = mobile ? 300 : 24;
      const room = window.innerHeight - HEADER - bottomReserve;
      if (r.top < HEADER || r.bottom > window.innerHeight - bottomReserve) {
        const offset = r.height > room ? HEADER + 8 : HEADER + Math.max(8, (room - r.height) / 2);
        window.scrollTo({ top: window.scrollY + r.top - offset, behavior: reduce ? "auto" : "smooth" });
      }
    };
    find();
    return () => {
      cancelled = true;
    };
  }, [step, route, pathname]);

  useEffect(() => {
    if (!step) return;
    let raf = 0;
    const tick = () => {
      const el = targetRef.current;
      if (el && el.isConnected) {
        const r = el.getBoundingClientRect();
        setRect((p) => (p && Math.abs(p.top - r.top) < 0.5 && Math.abs(p.left - r.left) < 0.5 && Math.abs(p.width - r.width) < 0.5 && Math.abs(p.height - r.height) < 0.5 ? p : { top: r.top, left: r.left, width: r.width, height: r.height }));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step]);

  const onPage = !!step && pathname === route;
  const paused = !!active && !!route && pathname !== route && !navigating.current;

  // Keyboard: ← → to move (mirrored in Arabic), Esc to leave, Tab stays inside the tour.
  useEffect(() => {
    if (!onPage || !active) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) || t.isContentEditable);
      if (e.key === "Escape") {
        if (document.querySelector('[role="listbox"], [data-radix-popper-content-wrapper]')) return; // let an open dropdown close first
        e.preventDefault();
        end("skipped");
        return;
      }
      if (!typing && (e.key === "ArrowRight" || e.key === "ArrowLeft") && !document.querySelector('[role="listbox"]')) {
        const rtl = document.documentElement.dir === "rtl";
        const forward = (e.key === "ArrowRight") !== rtl;
        e.preventDefault();
        if (forward) {
          if (active.step < total - 1) go(active.step + 1);
          else end("completed");
        } else if (active.step > 0) go(active.step - 1);
        return;
      }
      if (e.key === "Tab") {
        const zones = [tipRef.current, step?.interactive ? targetRef.current : null].filter(Boolean) as HTMLElement[];
        const items = zones.flatMap((z) => Array.from(z.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])')));
        if (!items.length) return;
        const i = items.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : i === -1 || i === items.length - 1 ? 0 : i + 1;
        items[next].focus();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [active, end, go, onPage, step, total]);

  // Move focus to the tooltip each step so screen readers announce it.
  useEffect(() => {
    if (!onPage) return;
    const id = window.setTimeout(() => tipRef.current?.querySelector<HTMLElement>("[data-tour-primary]")?.focus({ preventScroll: true }), 80);
    return () => window.clearTimeout(id);
  }, [onPage, step?.id]);

  /* ---------------- welcome ---------------- */
  const homeRole = roleOfPath(pathname);
  const showWelcome = !!store && !active && !!homeRole && pathname === ROLE_META[homeRole].home && !store.done[homeRole];

  if (!mounted || !store) return null;

  if (showWelcome && homeRole) {
    const w = TOURS[homeRole].welcome;
    return (
      <Dialog open onOpenChange={(o) => !o && save({ ...store, done: { ...store.done, [homeRole]: "skipped" } })}>
        <DialogContent className="max-w-md overflow-hidden p-0" data-testid="tour-welcome">
          <div className="border-b px-6 pb-5 pt-6">
            <div className="flex items-center gap-3">
              <LogoMark className="h-8 w-8" />
              <p className="eyebrow text-primary">{fill(L(TOUR_UI.tour), { role: L(TOUR_UI.roles[homeRole]) })} · 60s</p>
            </div>
            <DialogTitle className="mt-5 font-display text-[1.75rem] font-normal leading-tight">{L(w.title)}</DialogTitle>
            <DialogDescription className="mt-2 text-[15px] leading-relaxed">{L(w.body)}</DialogDescription>
          </div>
          <div className="flex flex-col-reverse gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" onClick={() => save({ ...store, done: { ...store.done, [homeRole]: "skipped" } })}>
              {L(TOUR_UI.skip)}
            </Button>
            <Button
              size="lg"
              autoFocus
              onClick={() => {
                navigating.current = false;
                save({ ...store, active: { role: homeRole, step: 0 } });
              }}
            >
              <PlayCircle /> {L(TOUR_UI.start)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!active || !tour || !step) return null;

  /* ---------------- paused (user navigated away) ---------------- */
  if (paused) {
    return createPortal(
      <div className="fixed bottom-4 start-1/2 z-[46] flex -translate-x-1/2 items-center gap-3 rounded-md border border-foreground/20 bg-card px-4 py-2.5 text-sm shadow-elevated rtl:translate-x-1/2" role="status">
        <Compass className="h-4 w-4 text-primary" aria-hidden />
        <span>
          {L(TOUR_UI.paused)} · <span className="tabular">{fill(L(TOUR_UI.step), { n: active.step + 1, total })}</span>
        </span>
        <Button size="sm" onClick={() => go(active.step)}>
          {L(TOUR_UI.resume)}
        </Button>
        <button type="button" onClick={() => end("skipped")} className="rounded-sm p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={L(TOUR_UI.close)}>
          <X className="h-4 w-4" />
        </button>
      </div>,
      document.body,
    );
  }

  if (!onPage) return null;

  // Very tall elements (a long table) are spotlit from the top, leaving room for the tooltip.
  const maxHole = typeof window === "undefined" ? Infinity : Math.max(160, window.innerHeight - HEADER - (window.innerWidth < 640 ? 330 : 300));
  const hole = rect && !missing ? { top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: Math.min(rect.height + PAD * 2, maxHole) } : null;
  const last = active.step === total - 1;
  const req = step.extra === "practice-contribution" ? state.requests.find((r) => pathname.endsWith(`/${r.id}`)) : undefined;

  return createPortal(
    <div data-testid="tour">
      {/* dimmer + spotlight: one element whose huge outer shadow dims everything except the hole */}
      {hole ? (
        <div
          aria-hidden
          className="pointer-events-none fixed z-[45] rounded-lg outline outline-2 outline-offset-0 outline-primary motion-safe:transition-[top,left,width,height] motion-safe:duration-300 motion-safe:ease-out"
          style={{ ...hole, boxShadow: "0 0 0 200vmax hsl(var(--overlay) / 0.62)" }}
        />
      ) : (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[45] bg-[hsl(var(--overlay)/0.62)]" />
      )}
      {/* click blockers around the spotlight; the spotlight itself is clickable only for interactive steps */}
      {hole ? (
        <>
          <Blocker style={{ top: 0, left: 0, right: 0, height: Math.max(hole.top, 0) }} />
          <Blocker style={{ top: hole.top + hole.height, left: 0, right: 0, bottom: 0 }} />
          <Blocker style={{ top: hole.top, left: 0, width: Math.max(hole.left, 0), height: hole.height }} />
          <Blocker style={{ top: hole.top, left: hole.left + hole.width, right: 0, height: hole.height }} />
          {!step.interactive && <Blocker style={hole} />}
        </>
      ) : (
        <Blocker style={{ inset: 0 }} />
      )}
      <Tooltip
        tipRef={tipRef}
        hole={hole}
        title={L(step.title)}
        body={missing ? `${L(step.body)} ${L(TOUR_UI.missing)}` : L(step.body)}
        eyebrow={fill(L(TOUR_UI.tour), { role: L(TOUR_UI.roles[active.role]) })}
        stepLabel={fill(L(TOUR_UI.step), { n: active.step + 1, total })}
        index={active.step}
        total={total}
        L={L}
        onBack={active.step > 0 ? () => go(active.step - 1) : undefined}
        onNext={() => (last ? end("completed") : go(active.step + 1))}
        onSkip={() => end("skipped")}
        last={last}
      >
        {step.extra === "practice-contribution" && req && <PracticeContribution remaining={remainingOf(req)} L={L} />}
      </Tooltip>
    </div>,
    document.body,
  );
}

function Blocker({ style }: { style: React.CSSProperties }) {
  return <div aria-hidden className="fixed z-[45]" style={style} onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.preventDefault()} />;
}

function Tooltip({
  tipRef,
  hole,
  title,
  body,
  eyebrow,
  stepLabel,
  index,
  total,
  L,
  onBack,
  onNext,
  onSkip,
  last,
  children,
}: {
  tipRef: React.RefObject<HTMLDivElement | null>;
  hole: Rect | null;
  title: string;
  body: string;
  eyebrow: string;
  stepLabel: string;
  index: number;
  total: number;
  L: (t: { en: string; ar: string }) => string;
  onBack?: () => void;
  onNext: () => void;
  onSkip: () => void;
  last: boolean;
  children?: React.ReactNode;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [mobile, setMobile] = useState(false);

  // Place the card beside the spotlight where it fits; dock it to the bottom on phones.
  useLayoutEffect(() => {
    const el = tipRef.current;
    if (!el) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw < 640;
    setMobile(isMobile);
    if (isMobile || !hole) {
      setPos((p) => (p === null ? p : null));
      return;
    }
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const gap = 14;
    const clampX = (x: number) => Math.min(Math.max(x, 16), vw - w - 16);
    const clampY = (y: number) => Math.min(Math.max(y, HEADER - 8), vh - h - 16);
    const rtl = document.documentElement.dir === "rtl";
    const alignX = rtl ? hole.left + hole.width - w : hole.left;
    let p: { top: number; left: number };
    if (vh - (hole.top + hole.height) >= h + gap + 16) p = { top: hole.top + hole.height + gap, left: clampX(alignX) };
    else if (hole.top - HEADER >= h + gap) p = { top: hole.top - h - gap, left: clampX(alignX) };
    else if (vw - (hole.left + hole.width) >= w + gap + 16) p = { top: clampY(hole.top), left: hole.left + hole.width + gap };
    else if (hole.left >= w + gap + 16) p = { top: clampY(hole.top), left: hole.left - w - gap };
    else p = { top: vh - h - 16, left: clampX(alignX) }; // element fills the screen: sit at the bottom
    setPos((prev) => (prev && Math.abs(prev.top - p.top) < 1 && Math.abs(prev.left - p.left) < 1 ? prev : p));
  });

  return (
    <div
      ref={tipRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
      aria-describedby="tour-body"
      className={cn(
        "fixed z-[47] w-[min(360px,calc(100vw-2rem))] rounded-lg border border-foreground/25 bg-card text-card-foreground shadow-elevated",
        "motion-safe:transition-[top,left,opacity] motion-safe:duration-300 motion-safe:ease-out",
        mobile ? "inset-x-3 bottom-3 w-auto" : !pos && "start-1/2 top-1/2 -translate-y-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2",
      )}
      style={!mobile && pos ? { top: pos.top, left: pos.left } : undefined}
    >
      <div className="px-5 pb-4 pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow text-primary">{eyebrow}</p>
          <button type="button" onClick={onSkip} className="rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={L(TOUR_UI.close)}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <ol className="mt-3 flex gap-1" aria-hidden>
          {Array.from({ length: total }).map((_, i) => (
            <li key={i} className={cn("h-[3px] flex-1 transition-colors", i <= index ? "bg-primary" : "bg-border")} />
          ))}
        </ol>
        <h2 id="tour-title" className="mt-4 text-[1.4rem] font-normal leading-tight">
          {title}
        </h2>
        <p id="tour-body" className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
          {body}
        </p>
        {children}
      </div>
      <div className="flex items-center justify-between gap-2 border-t px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="tabular text-xs text-muted-foreground" aria-live="polite">
            {stepLabel}
          </span>
          {!last && (
            <button type="button" onClick={onSkip} className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              {L(TOUR_UI.skip)}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft /> {L(TOUR_UI.back)}
            </Button>
          )}
          <Button size="sm" onClick={onNext} data-tour-primary>
            {last ? (
              <>
                <Check /> {L(TOUR_UI.finish)}
              </>
            ) : (
              <>
                {L(TOUR_UI.next)} <ArrowRight />
              </>
            )}
          </Button>
        </div>
      </div>
      <p className="sr-only">{L(TOUR_UI.keys)}</p>
    </div>
  );
}

/** Tutorial-only: shows what a contribution would do. Touches no data and moves no money. */
function PracticeContribution({ remaining, L }: { remaining: number; L: (t: { en: string; ar: string }) => string }) {
  const options = Array.from(new Set([50, 100, remaining].filter((x) => x > 0 && x <= remaining))).sort((a, b) => a - b);
  const [pick, setPick] = useState<number | null>(null);
  return (
    <div className="mt-4 rounded-md border border-dashed border-primary/50 p-3">
      <p className="eyebrow flex items-center gap-1.5 text-foreground">
        <HandCoins className="h-3.5 w-3.5 text-primary" aria-hidden /> {L(TOUR_UI.practiceTitle)}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label={L(TOUR_UI.practiceTitle)}>
        {options.map((x) => (
          <button
            key={x}
            type="button"
            aria-pressed={pick === x}
            onClick={() => setPick(x)}
            className={cn("tabular rounded-sm border px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", pick === x ? "border-primary bg-primary text-primary-foreground" : "hover:border-foreground/50")}
          >
            {aed(x)}
          </button>
        ))}
      </div>
      <p className="mt-3 flex items-baseline justify-between gap-2 text-sm">
        <span className="text-muted-foreground">{L(TOUR_UI.practiceLeft)}</span>
        <span className="flex items-baseline gap-2">
          {pick !== null && <span className="tabular text-xs text-muted-foreground line-through">{aed(remaining)}</span>}
          <AnimatedNumber value={remaining - (pick ?? 0)} className={cn("font-medium", pick === remaining && "text-success")} />
        </span>
      </p>
      <p className="mt-2 text-xs text-muted-foreground">{L(TOUR_UI.practiceNote)}</p>
    </div>
  );
}
