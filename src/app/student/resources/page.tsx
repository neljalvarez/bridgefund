"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { BookOpen, Calculator, FlaskConical, Laptop, Package, Printer, Recycle, Wifi, Wrench, type LucideIcon } from "lucide-react";
import type { Resource, ResourceType } from "@/lib/types";
import { useStore } from "@/lib/store";
import { cancelReservation, reserveResource, updateReservation } from "@/lib/actions";
import { institutionOf } from "@/lib/selectors";
import { RESOURCE_TYPE_LABEL, fmtDate, isoDaysFromNow, usd } from "@/lib/format";
import { ChunkyProgress, EmptyState, PageHeader, Stat } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/Modal";
import { Window } from "@/components/ui/Window";

const ICON: Record<ResourceType, LucideIcon> = {
  calculator: Calculator,
  laptop: Laptop,
  textbook: BookOpen,
  "lab-equipment": FlaskConical,
  "stem-kit": Wrench,
  "free-resource": Recycle,
  "school-equipment": Printer,
  connectivity: Wifi,
};

function ReserveModal({ res, onClose }: { res: Resource | null; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [date, setDate] = useState(isoDaysFromNow(1).slice(0, 10));
  if (!res) return null;
  const inst = institutionOf(state, res.institutionId);
  return (
    <Modal
      open={!!res}
      onClose={onClose}
      title={`Reserve: ${res.name}`}
      size="sm"
      footer={
        <>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              dispatch(reserveResource(res.id, state.currentStudentId, new Date(`${date}T12:00:00`).toISOString(), "student"), {
                toast: { title: "Reserved!", body: `You saved about ${usd(res.retailValue)} by borrowing.`, tone: "success" },
                sound: "coin",
              });
              onClose();
            }}
          >
            Confirm reservation
          </button>
        </>
      }
    >
      <div className="space-y-3 text-sm">
        <p>{res.description}</p>
        <p className="text-muted">
          Held by {inst?.name} · loan term: {res.loanTerm}
        </p>
        <div>
          <label htmlFor="pickup" className="label">
            Pickup date
          </label>
          <input id="pickup" type="date" className="input" value={date} min={isoDaysFromNow(0).slice(0, 10)} onChange={(e) => setDate(e.target.value)} />
        </div>
        <p className="border-2 border-line bg-sage/40 p-2 text-xs">Estimated saving vs buying new: {usd(res.retailValue)}</p>
      </div>
    </Modal>
  );
}

function ResourcesInner() {
  const { state, dispatch, toast } = useStore();
  const params = useSearchParams();
  const focus = params.get("r");
  const [type, setType] = useState<ResourceType | "all">("all");
  const [reserving, setReserving] = useState<Resource | null>(null);
  const mine = state.reservations.filter((r) => r.studentId === state.currentStudentId);
  const saved = mine.reduce((a, r) => a + (state.resources.find((x) => x.id === r.resourceId)?.retailValue ?? 0), 0);
  const networkSaved = state.reservations.reduce((a, r) => a + (state.resources.find((x) => x.id === r.resourceId)?.retailValue ?? 0), 0);
  const list = state.resources.filter((r) => type === "all" || r.type === type);
  const types = Object.keys(RESOURCE_TYPE_LABEL) as ResourceType[];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="You've saved by borrowing" value={saved} tone="forest" />
        <Stat label="Items you've reserved" value={String(mine.length)} money={false} />
        <Stat label="Saved across the network" value={networkSaved} hint="Simulated demo total" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by resource type">
        <button type="button" aria-pressed={type === "all"} onClick={() => setType("all")} className={`btn btn-sm ${type === "all" ? "bg-forest text-onforest" : "bg-surface"}`}>
          All
        </button>
        {types.map((t) => {
          const I = ICON[t];
          return (
            <button key={t} type="button" aria-pressed={type === t} onClick={() => setType(t)} className={`btn btn-sm ${type === t ? "bg-forest text-onforest" : "bg-surface"}`}>
              <I size={13} /> {RESOURCE_TYPE_LABEL[t]}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {list.length === 0 && <EmptyState title="Nothing in this category yet" />}
          {list.map((r) => {
            const I = ICON[r.type];
            const inst = institutionOf(state, r.institutionId);
            const free = r.type === "free-resource";
            return (
              <article key={r.id} className={`panel flex flex-col p-4 ${focus === r.id ? "ring-4 ring-gold" : ""}`}>
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-line bg-sage">
                    <I size={18} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold leading-snug">{r.name}</h3>
                    <p className="text-xs text-muted">
                      {inst?.name} · {inst?.city}
                    </p>
                  </div>
                </div>
                <p className="mt-2 flex-1 text-sm text-muted">{r.description}</p>
                <div className="mt-3">
                  {free ? (
                    <p className="text-xs font-semibold text-forest">Unlimited · no reservation needed</p>
                  ) : (
                    <>
                      <div className="mb-1 flex justify-between text-xs">
                        <span>
                          <strong>{r.available}</strong> of {r.total} available
                        </span>
                        <span className="text-muted">{r.loanTerm}</span>
                      </div>
                      <ChunkyProgress value={r.available} max={r.total} segments={Math.min(r.total, 12)} tone={r.available ? "forest" : "terra"} label={`${r.name} availability`} />
                    </>
                  )}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs">
                    Saves <span className="font-pixel text-base text-forest">{usd(r.retailValue)}</span>
                  </span>
                  {r.available > 0 ? (
                    <button type="button" className="btn-primary btn-sm" onClick={() => setReserving(r)}>
                      {free ? "Add to my kit" : "Reserve"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-ghost btn-sm"
                      onClick={() => toast({ title: "Added to waitlist", body: `${inst?.name} will notify you when a ${r.name.toLowerCase()} is returned.`, tone: "info" })}
                    >
                      Join waitlist
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <Window title="My reservations" icon={<Package size={14} />} className="lg:sticky lg:top-24 lg:self-start">
          {mine.length === 0 ? (
            <p className="text-sm text-muted">Nothing reserved yet. BridgeEngine also reserves equipment automatically when borrowing closes part of a gap.</p>
          ) : (
            <ul className="space-y-3">
              {mine.map((rv) => {
                const res = state.resources.find((x) => x.id === rv.resourceId);
                return (
                  <li key={rv.id} className="border-2 border-line bg-bg p-2.5 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{res?.name}</p>
                        <p className="text-xs text-muted">
                          Pickup {fmtDate(rv.pickupDate)} · {rv.status}
                        </p>
                      </div>
                      <span className="font-pixel text-forest">{usd(res?.retailValue ?? 0)}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {rv.status === "Reserved" && (
                        <>
                          <button type="button" className="btn-ghost btn-sm" onClick={() => dispatch(updateReservation(rv.id, "Collected"))}>
                            Mark collected
                          </button>
                          <button type="button" className="btn-ghost btn-sm" onClick={() => dispatch(cancelReservation(rv.id), { toast: { title: "Reservation cancelled", tone: "info" } })}>
                            Cancel
                          </button>
                        </>
                      )}
                      {rv.status === "Collected" && (
                        <button type="button" className="btn-ghost btn-sm" onClick={() => dispatch(updateReservation(rv.id, "Returned"), { toast: { title: "Returned — thank you!", body: "The next student can now borrow it.", tone: "success" } })}>
                          Mark returned
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Window>
      </div>
      <ReserveModal key={reserving?.id ?? "none"} res={reserving} onClose={() => setReserving(null)} />
    </>
  );
}

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader kicker="Resource rescue" title="Borrow it. Don't buy it." description="Calculators, laptops, lab kits and textbooks your schools already own — reserved in a few clicks, returned for the next student." />
      <Suspense>
        <ResourcesInner />
      </Suspense>
    </div>
  );
}
