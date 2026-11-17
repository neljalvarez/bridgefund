"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gamepad2, Menu, Moon, RotateCcw, Search, Sun, Volume2, VolumeX, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { setRole, toggleSound } from "@/lib/actions";
import type { Role } from "@/lib/types";
import { Logo } from "./Logo";
import { PUBLIC_NAV, ROLE_META } from "./nav";
import { SearchPalette } from "./SearchPalette";
import { NotificationBell } from "./NotificationBell";
import { Modal } from "@/components/ui/Modal";

export function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("bf-theme", next ? "dark" : "light");
    } catch {}
    setDark(next);
  };
  return { dark, toggle };
}

export function RoleSwitcher({ onSwitched, stacked }: { onSwitched?: () => void; stacked?: boolean }) {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const go = (r: Role) => {
    dispatch(setRole(r), { sound: "click" });
    router.push(ROLE_META[r].home);
    onSwitched?.();
  };
  return (
    <div role="radiogroup" aria-label="Switch demo role" className={`flex border-2 border-line bg-surface ${stacked ? "flex-col" : ""}`}>
      {(Object.keys(ROLE_META) as Role[]).map((r) => {
        const m = ROLE_META[r];
        const active = state.role === r;
        return (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => go(r)}
            title={`View as ${m.label}: ${m.persona}`}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold transition-colors ${active ? "bg-forest text-onforest" : "text-muted hover:bg-raised hover:text-ink"} ${
              stacked ? "justify-start" : ""
            }`}
          >
            <m.icon size={14} aria-hidden />
            <span>{m.label}</span>
            {stacked && <span className="ml-auto text-[11px] font-normal opacity-80">{m.persona}</span>}
          </button>
        );
      })}
    </div>
  );
}

function ResetDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { reset } = useStore();
  const router = useRouter();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reset demo?"
      size="sm"
      footer={
        <>
          <button className="btn-ghost" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-terra"
            type="button"
            onClick={() => {
              reset();
              onClose();
              router.push("/");
            }}
          >
            <RotateCcw size={14} /> Reset everything
          </button>
        </>
      }
    >
      <p className="text-sm">This restores every student, request, balance and reservation to its starting point. Your theme preference is kept.</p>
    </Modal>
  );
}

export function TopBar() {
  const { state, dispatch } = useStore();
  const { dark, toggle } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const iconBtn = "flex h-9 w-9 items-center justify-center border-2 border-line bg-surface hover:bg-raised";

  return (
    <header className="no-print sticky top-0 z-50 border-b-2 border-line bg-bg">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Logo />
        <nav aria-label="Main" className="ml-4 hidden items-center gap-4 text-sm font-medium text-muted xl:flex">
          {PUBLIC_NAV.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={() => setSearchOpen(true)} className="hidden h-9 items-center gap-2 border-2 border-line bg-surface px-2.5 text-sm text-muted hover:bg-raised md:flex" aria-label="Search (Ctrl+K)">
            <Search size={15} aria-hidden /> <span>Search</span>
            <kbd className="ml-2 border border-line/40 px-1 font-mono text-[10px]">⌘K</kbd>
          </button>
          <button type="button" onClick={() => setSearchOpen(true)} className={`${iconBtn} md:hidden`} aria-label="Search">
            <Search size={16} />
          </button>

          <div className="hidden lg:block">
            <RoleSwitcher />
          </div>

          <Link href="/demo" className="btn-gold hidden h-9 py-0 sm:inline-flex" aria-label="Open judge demo mode">
            <Gamepad2 size={16} aria-hidden /> Judge demo
          </Link>

          <NotificationBell />

          <button type="button" onClick={toggle} className={`${iconBtn} hidden md:flex`} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            type="button"
            onClick={() => dispatch(toggleSound(), { toast: { title: state.sound ? "Sound effects off" : "Sound effects on", tone: "info" } })}
            className={`${iconBtn} hidden md:flex`}
            aria-label={state.sound ? "Turn sound effects off" : "Turn sound effects on"}
            aria-pressed={state.sound}
          >
            {state.sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button type="button" onClick={() => setResetOpen(true)} className={`${iconBtn} hidden md:flex`} aria-label="Reset demo" title="Reset demo">
            <RotateCcw size={16} />
          </button>
          <button type="button" onClick={() => setMenuOpen(true)} className={`${iconBtn} lg:hidden`} aria-label="Open menu" aria-expanded={menuOpen}>
            <Menu size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div className="fixed inset-0 z-[60] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-[#232824]/50" onClick={() => setMenuOpen(false)} aria-hidden />
            <motion.aside
              className="panel absolute right-0 top-0 flex h-full w-[min(340px,90vw)] flex-col gap-5 overflow-y-auto p-4"
              initial={{ x: 40 }}
              animate={{ x: 0 }}
              exit={{ x: 40 }}
              role="dialog"
              aria-label="Menu"
            >
              <div className="flex items-center justify-between">
                <Logo />
                <button type="button" onClick={() => setMenuOpen(false)} className={iconBtn} aria-label="Close menu">
                  <X size={18} />
                </button>
              </div>
              <div>
                <p className="label">View as</p>
                <RoleSwitcher stacked onSwitched={() => setMenuOpen(false)} />
              </div>
              <Link href="/demo" onClick={() => setMenuOpen(false)} className="btn-gold">
                <Gamepad2 size={16} /> Judge demo mode
              </Link>
              <nav aria-label="Mobile" className="flex flex-col gap-2 text-sm">
                <Link href="/" onClick={() => setMenuOpen(false)} className="hover:underline">
                  Home
                </Link>
                {PUBLIC_NAV.map((l) => (
                  <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="hover:underline">
                    {l.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto grid grid-cols-3 gap-2">
                <button type="button" onClick={toggle} className="btn-ghost btn-sm flex-col py-2">
                  {dark ? <Sun size={16} /> : <Moon size={16} />} {dark ? "Light" : "Dark"}
                </button>
                <button type="button" onClick={() => dispatch(toggleSound())} className="btn-ghost btn-sm flex-col py-2" aria-pressed={state.sound}>
                  {state.sound ? <Volume2 size={16} /> : <VolumeX size={16} />} Sound
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setResetOpen(true);
                  }}
                  className="btn-ghost btn-sm flex-col py-2"
                >
                  <RotateCcw size={16} /> Reset
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ResetDialog open={resetOpen} onClose={() => setResetOpen(false)} />
    </header>
  );
}
