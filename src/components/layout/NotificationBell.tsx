"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { markAllRead, markRead } from "@/lib/actions";
import { ROLE_META } from "./nav";

function timeAgo(iso: string) {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

export function NotificationBell() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const mine = state.notifications.filter((n) => n.role === state.role);
  const unread = mine.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center border-2 border-line bg-surface hover:bg-raised"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell size={16} />
        {unread > 0 && (
          <motion.span key={unread} initial={{ scale: 0.4 }} animate={{ scale: 1 }} className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center border-2 border-line bg-terra px-1 font-pixel text-[10px] text-[#232824]">
            {unread}
          </motion.span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="panel absolute right-0 top-11 z-[65] w-[min(360px,calc(100vw-2rem))]"
            role="region"
            aria-label="Notifications"
          >
            <div className="window-bar">
              <span className="font-pixel text-sm">Inbox · {ROLE_META[state.role].label}</span>
              {unread > 0 && (
                <button type="button" onClick={() => dispatch(markAllRead(state.role))} className="flex items-center gap-1 text-xs hover:underline">
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
            </div>
            <ul className="scrollbar-thin max-h-[60vh] overflow-y-auto">
              {mine.length === 0 && <li className="p-6 text-center text-sm text-muted">No notifications for this role yet.</li>}
              {mine.slice(0, 20).map((n) => (
                <li key={n.id} className="border-b border-line/20 last:border-0">
                  <button
                    type="button"
                    onClick={() => {
                      dispatch(markRead(n.id));
                      setOpen(false);
                      if (n.href) router.push(n.href);
                    }}
                    className="flex w-full gap-3 px-3 py-2.5 text-left hover:bg-raised"
                  >
                    <span className={`mt-1.5 h-2 w-2 shrink-0 ${n.read ? "bg-transparent" : "bg-terra"}`} aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{n.title}</span>
                      <span className="block text-xs text-muted">{n.body}</span>
                      <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-muted">{timeAgo(n.at)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
