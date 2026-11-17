"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { markAllRead, markRead } from "@/lib/actions";
import { timeAgo } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ROLE_META } from "./nav";

export function NotificationCenter() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const mine = state.notifications.filter((n) => n.role === state.role);
  const unread = mine.filter((n) => !n.read).length;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}>
          <Bell />
          {unread > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">{unread}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(380px,calc(100vw-1.5rem))]">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">{ROLE_META[state.role].label} view</p>
          </div>
          {unread > 0 && (
            <Button variant="ghost" size="sm" onClick={() => dispatch(markAllRead(state.role))}>
              <CheckCheck /> Mark all read
            </Button>
          )}
        </div>
        <ul className="max-h-[50vh] overflow-y-auto">
          {mine.length === 0 && <li className="px-4 py-8 text-center text-sm text-muted-foreground">You&apos;re all caught up.</li>}
          {mine.slice(0, 12).map((n) => (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => {
                  dispatch(markRead(n.id));
                  setOpen(false);
                  if (n.href) router.push(n.href);
                }}
                className="flex w-full gap-3 border-b px-4 py-3 text-left transition-colors last:border-0 hover:bg-muted/60"
              >
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-primary")} aria-hidden />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{n.title}</span>
                  <span className="block text-[13px] text-muted-foreground">{n.body}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{timeAgo(n.at)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t p-2">
          <Button asChild variant="ghost" size="sm" className="w-full" onClick={() => setOpen(false)}>
            <Link href="/notifications">View all notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
