"use client";

import Link from "next/link";
import { CheckCheck } from "lucide-react";
import { useStore } from "@/lib/store";
import { markAllRead, markRead } from "@/lib/actions";
import { fmtDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/shared/kit";
import { ROLE_META } from "@/components/app/nav";

export default function NotificationsPage() {
  const { state, dispatch } = useStore();
  const mine = state.notifications.filter((n) => n.role === state.role);
  return (
    <>
      <PageHeader
        title="Notifications"
        description={`Deadline reminders and request status updates for the ${ROLE_META[state.role].label.toLowerCase()} view.`}
        actions={
          mine.some((n) => !n.read) && (
            <Button variant="outline" onClick={() => dispatch(markAllRead(state.role), { info: "All notifications marked as read" })}>
              <CheckCheck /> Mark all read
            </Button>
          )
        }
      />
      {mine.length === 0 ? (
        <EmptyState title="You're all caught up" />
      ) : (
        <Card>
          <ul className="divide-y">
            {mine.map((n) => (
              <li key={n.id} className={cn("flex items-start gap-3 px-5 py-4", !n.read && "bg-primary-light/30")}>
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-primary")} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{fmtDateTime(n.at)}</p>
                </div>
                {n.href && (
                  <Button asChild variant="ghost" size="sm" onClick={() => dispatch(markRead(n.id))}>
                    <Link href={n.href}>Open</Link>
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
