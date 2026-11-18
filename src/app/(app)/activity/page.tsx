"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { fmtDateTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, PageHeader } from "@/components/shared/kit";

export default function ActivityPage() {
  const { state } = useStore();
  const [filter, setFilter] = useState("all");
  const list = state.activity.filter((a) => filter === "all" || a.role === filter);
  return (
    <>
      <PageHeader title="Activity history" description="Everything that happened in this demo." />
      <Tabs value={filter} onValueChange={setFilter} className="mb-4">
        <TabsList className="h-auto flex-wrap">
          {["all", "student", "institution", "sponsor", "system"].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize" aria-controls={undefined}>
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {list.length === 0 ? (
        <EmptyState title="No activity yet" />
      ) : (
        <Card>
          <ul className="divide-y">
            {list.map((a) => (
              <li key={a.id} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-3 text-sm">
                  <Badge variant={a.role === "student" ? "info" : a.role === "sponsor" ? "accent" : a.role === "institution" ? "neutral" : "outline"} className="w-20 justify-center capitalize">
                    {a.role}
                  </Badge>
                  {a.text}
                </span>
                <span className="text-xs text-muted-foreground">{fmtDateTime(a.at)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
