"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { CheckCircle2, MapPin, Search } from "lucide-react";
import { RESOURCE_ICON } from "@/components/shared/resourceIcons";
import type { Resource, ResourceType } from "@/lib/types";
import { useStore } from "@/lib/store";
import { reserveResource, updateReservation } from "@/lib/actions";
import { institutionOf } from "@/lib/selectors";
import { RESOURCE_LABEL, fmtDate, isoDaysFromNow, sum, aed } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, PageHeader, StatCard } from "@/components/shared/kit";



const STATUS_VARIANT = { Reserved: "info", Collected: "accent", Returned: "success", Cancelled: "neutral" } as const;

function Rescue() {
  const { state, dispatch } = useStore();
  const focus = useSearchParams().get("r");
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [loc, setLoc] = useState("all");
  const [reserving, setReserving] = useState<Resource | null>(null);
  const [date, setDate] = useState(isoDaysFromNow(1).slice(0, 10));
  const mine = state.reservations.filter((r) => r.studentId === state.currentStudentId);
  const value = (id: string) => state.resources.find((x) => x.id === id)?.retailValue ?? 0;
  const saved = sum(mine.filter((r) => r.status !== "Cancelled").map((r) => value(r.resourceId)));
  const locations = [...new Set(state.resources.map((r) => institutionOf(state, r.institutionId)?.city ?? ""))].sort();
  const list = state.resources.filter((r) => {
    const inst = institutionOf(state, r.institutionId);
    if (type !== "all" && r.type !== type) return false;
    if (loc !== "all" && inst?.city !== loc) return false;
    if (q && !`${r.name} ${r.description} ${inst?.name} ${inst?.city}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard label="Saved by borrowing" value={saved} tone="primary" hint="Estimated retail value avoided" />
        <StatCard label="Active loans" value={mine.filter((r) => ["Reserved", "Collected"].includes(r.status)).length} money={false} />
        <StatCard label="Items available to borrow" value={sum(state.resources.map((r) => r.available))} money={false} />
      </div>

      <Card className="mt-6 flex flex-col gap-3 p-4 md:flex-row md:items-end">
        <div className="relative flex-1">
          <Label htmlFor="rq" className="text-xs text-muted-foreground">
            Search
          </Label>
          <Search className="pointer-events-none absolute bottom-2.5 start-3 h-4 w-4 text-muted-foreground" />
          <Input id="rq" className="mt-1.5 ps-9" placeholder="Calculator, laptop, microscope…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="md:w-56">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="mt-1.5" aria-label="Category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {(Object.keys(RESOURCE_LABEL) as ResourceType[]).map((t) => (
                <SelectItem key={t} value={t}>
                  {RESOURCE_LABEL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:w-48">
          <Label className="text-xs text-muted-foreground">Location</Label>
          <Select value={loc} onValueChange={setLoc}>
            <SelectTrigger className="mt-1.5" aria-label="Location">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {locations.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        {list.length === 0 ? (
          <EmptyState title="No resources match" description="Try another category or location." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((r) => {
              const Icon = RESOURCE_ICON[r.type];
              const inst = institutionOf(state, r.institutionId);
              return (
                <Card key={r.id} className={cn("flex flex-col p-5", focus === r.id && "ring-2 ring-primary/40")}>
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium">{r.name}</p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {inst?.name} · {inst?.city}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 flex-1 text-sm text-muted-foreground">{r.description}</p>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span>
                      <strong className="tabular">{r.available}</strong> of {r.total} available · {r.loanTerm}
                    </span>
                    <span className="font-medium text-primary">Saves {aed(r.retailValue)}</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div className={cn("h-full", r.available ? "bg-primary" : "bg-warning")} style={{ width: `${(r.available / r.total) * 100}%` }} />
                  </div>
                  <Button className="mt-4" variant={r.available ? "default" : "outline"} disabled={!r.available} onClick={() => setReserving(r)}>
                    {r.available ? "Request and reserve" : "Currently unavailable"}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
        <Card className="h-fit xl:sticky xl:top-20">
          <CardHeader>
            <CardTitle>My borrowing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mine.length === 0 && <p className="text-sm text-muted-foreground">Nothing borrowed yet. BridgeEngine also reserves equipment automatically when borrowing closes part of a gap.</p>}
            {mine.map((rv) => {
              const res = state.resources.find((x) => x.id === rv.resourceId);
              return (
                <div key={rv.id} className="rounded-lg border p-3 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{res?.name}</p>
                      <p className="text-xs text-muted-foreground">Pickup {fmtDate(rv.pickupDate)}</p>
                    </div>
                    <Badge variant={STATUS_VARIANT[rv.status]}>{rv.status}</Badge>
                  </div>
                  <ol className="mt-3 flex gap-1" aria-label={`Borrowing status: ${rv.status}`}>
                    {["Reserved", "Collected", "Returned"].map((s, i) => (
                      <li key={s} className={cn("h-1 flex-1 rounded-full", rv.status !== "Cancelled" && ["Reserved", "Collected", "Returned"].indexOf(rv.status) >= i ? "bg-primary" : "bg-secondary")} />
                    ))}
                  </ol>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-primary">{rv.status !== "Cancelled" ? `Saved ${aed(res?.retailValue ?? 0)}` : "Cancelled"}</span>
                    <span className="flex gap-1">
                      {rv.status === "Reserved" && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => dispatch(updateReservation(rv.id, "Cancelled"), { info: "Reservation cancelled" })}>
                            Cancel
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => dispatch(updateReservation(rv.id, "Collected"), { success: "Marked as collected" })}>
                            Collected
                          </Button>
                        </>
                      )}
                      {rv.status === "Collected" && (
                        <Button size="sm" variant="outline" onClick={() => dispatch(updateReservation(rv.id, "Returned"), { success: "Returned — thank you!", description: "The next student can now borrow it." })}>
                          Mark returned
                        </Button>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!reserving} onOpenChange={(o) => !o && setReserving(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reserve {reserving?.name}</DialogTitle>
            <DialogDescription>
              Held by {reserving && institutionOf(state, reserving.institutionId)?.name}. Loan term: {reserving?.loanTerm.toLowerCase()}.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="pickup">Pickup date</Label>
            <Input id="pickup" type="date" className="mt-1.5" min={isoDaysFromNow(0).slice(0, 10)} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <p className="flex items-center gap-2 rounded-lg bg-primary-light/60 p-3 text-sm">
            <CheckCircle2 className="h-4 w-4 text-primary" /> Estimated saving vs. buying new: <strong>{aed(reserving?.retailValue ?? 0)}</strong>
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReserving(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!reserving) return;
                dispatch(reserveResource(reserving.id, state.currentStudentId, new Date(`${date}T12:00:00`).toISOString()), { success: "Reserved", description: `You saved about ${aed(reserving.retailValue)} by borrowing.` });
                setReserving(null);
              }}
            >
              Confirm reservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function ResourcesPage() {
  return (
    <>
      <PageHeader title="Borrow equipment" description="Calculators, laptops and lab kits your schools already own." />
      <Suspense>
        <Rescue />
      </Suspense>
    </>
  );
}
