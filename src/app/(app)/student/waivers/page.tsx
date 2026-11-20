"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, CalendarDays, MapPin, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { currentStudent } from "@/lib/selectors";
import { ASSISTANCE, EMIRATES, EMIRATE_AR, OPPORTUNITIES, VERIFIED_ON, oppStatus, type OppStatus } from "@/lib/uae";
import { OPP_LABEL, fmtDateLong } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, PageHeader } from "@/components/shared/kit";

const STATUS_TONE: Record<OppStatus, "success" | "info" | "neutral"> = { Open: "success", Upcoming: "info", Closed: "neutral" };

function Filter({ value, onChange, label, children }: { value: string; onChange: (v: string) => void; label: string; children: React.ReactNode }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-[190px]" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );
}

export default function OpportunitiesPage() {
  const { state } = useStore();
  const student = currentStudent(state);
  const [emirate, setEmirate] = useState("all");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const today = new Date();

  const opps = useMemo(
    () =>
      OPPORTUNITIES.map((o) => ({ o, st: oppStatus(o, today) }))
        .filter(({ o, st }) => (emirate === "all" || o.emirates === "All" || o.emirates.includes(emirate as never)) && (category === "all" || o.category === category) && (status === "all" || st === status))
        .sort((a, b) => ["Open", "Upcoming", "Closed"].indexOf(a.st) - ["Open", "Upcoming", "Closed"].indexOf(b.st)),
    [emirate, category, status], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const help = ASSISTANCE.filter((a) => emirate === "all" || a.emirates === "All" || a.emirates.includes(emirate as never));

  return (
    <>
      <PageHeader title="Opportunities" description="Real UAE programmes, and the help that cuts their cost." />
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap" data-tour="opp-filters">
        <Filter value={emirate} onChange={setEmirate} label="Emirate">
          <SelectItem value="all">All emirates</SelectItem>
          {EMIRATES.map((e) => (
            <SelectItem key={e} value={e}>
              {state.display.locale === "ar" ? EMIRATE_AR[e] : e}
              {e === student.emirate ? (state.display.locale === "ar" ? " (إمارتك)" : " (yours)") : ""}
            </SelectItem>
          ))}
        </Filter>
        <Filter value={category} onChange={setCategory} label="Type">
          <SelectItem value="all">All types</SelectItem>
          {Object.entries(OPP_LABEL).map(([k, v]) => (
            <SelectItem key={k} value={k}>
              {v}
            </SelectItem>
          ))}
        </Filter>
        <Filter value={status} onChange={setStatus} label="Status">
          <SelectItem value="all">Any status</SelectItem>
          <SelectItem value="Open">Open</SelectItem>
          <SelectItem value="Upcoming">Upcoming</SelectItem>
          <SelectItem value="Closed">Closed</SelectItem>
        </Filter>
      </div>

      <Tabs defaultValue="opportunities">
        <TabsList>
          <TabsTrigger value="opportunities">Opportunities ({opps.length})</TabsTrigger>
          <TabsTrigger value="help">Cost help ({help.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="mt-4">
          {opps.length === 0 ? (
            <EmptyState title="Nothing matches these filters" />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {opps.map(({ o, st }) => (
                <Card key={o.id} className="flex flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{OPP_LABEL[o.category]}</p>
                      <h3 className="mt-0.5 font-semibold leading-snug">{o.name}</h3>
                      <p className="text-sm text-muted-foreground">{o.organiser}</p>
                    </div>
                    <Badge variant={STATUS_TONE[st]}>{st}</Badge>
                  </div>
                  <dl className="mt-4 space-y-2 text-sm">
                    <div className="flex gap-2">
                      <dt className="sr-only">Location</dt>
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <dd>{o.location}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="sr-only">Dates</dt>
                      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <dd>
                        {o.deadline ? <span className="font-medium">Deadline {fmtDateLong(o.deadline)}. </span> : null}
                        <span className="text-muted-foreground">{o.dateNote}</span>
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="sr-only">Eligibility</dt>
                      <Users className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <dd className="text-muted-foreground">{o.eligibility.join(" · ")}</dd>
                    </div>
                  </dl>
                  <div className="mt-4 rounded-lg bg-muted/50 px-3 py-2.5 text-sm">
                    <p>
                      <span className="text-muted-foreground">Official fees: </span>
                      {o.publishedFees ?? "Not published by the organiser"}
                    </p>
                    <p className="mt-0.5">
                      <span className="text-muted-foreground">Plan for: </span>
                      {o.planFor.join(", ")}
                    </p>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <Button asChild size="sm" variant="outline">
                      <a href={o.url} target="_blank" rel="noopener noreferrer">
                        Official page <ArrowUpRight />
                      </a>
                    </Button>
                    {st !== "Closed" && (
                      <Button asChild size="sm">
                        <Link href={`/student/scanner?title=${encodeURIComponent(o.name)}&provider=${encodeURIComponent(o.organiser)}&category=${o.category}${o.deadline ? `&deadline=${o.deadline}` : ""}`}>Plan my costs</Link>
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="help" className="mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {help.map((a) => {
              const local = a.emirates === "All" || a.emirates.includes(student.emirate);
              return (
                <Card key={a.id} className={cn("flex flex-col p-5", !local && "opacity-80")}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{a.helpsWith}</p>
                      <h3 className="mt-0.5 font-semibold leading-snug">{a.name}</h3>
                      <p className="text-sm text-muted-foreground">{a.provider}</p>
                    </div>
                    <Badge variant="outline">{a.emirates === "All" ? "UAE-wide" : a.emirates.join(", ")}</Badge>
                  </div>
                  <p className="mt-3 text-sm font-medium text-primary">{a.benefit}</p>
                  <dl className="mt-3 space-y-1.5 text-sm">
                    <div>
                      <dt className="inline text-muted-foreground">Cost: </dt>
                      <dd className="inline">{a.cost}</dd>
                    </div>
                    <div>
                      <dt className="inline text-muted-foreground">Who: </dt>
                      <dd className="inline">{a.eligibility.join(" · ")}</dd>
                    </div>
                    <div>
                      <dt className="inline text-muted-foreground">How: </dt>
                      <dd className="inline">{a.apply}</dd>
                    </div>
                  </dl>
                  <div className="mt-auto pt-4">
                    <Button asChild size="sm" variant="outline">
                      <a href={a.url} target="_blank" rel="noopener noreferrer">
                        Official page <ArrowUpRight />
                      </a>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <p className="mt-8 text-xs text-muted-foreground">
        Checked against official sources on {fmtDateLong(`${VERIFIED_ON}T12:00:00+04:00`)}. BridgeFund isn&apos;t affiliated with these organisations — confirm details on the official page before applying.
      </p>
    </>
  );
}
