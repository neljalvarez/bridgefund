"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { ResourceType } from "@/lib/types";
import { useStore } from "@/lib/store";
import { addResource, adjustInventory, updateReservation } from "@/lib/actions";
import { institutionOf, studentOf } from "@/lib/selectors";
import { RESOURCE_LABEL, fmtDate, sum, aed } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, FieldError, PageHeader, StatCard } from "@/components/shared/kit";
import { RESOURCE_ICON } from "@/components/shared/resourceIcons";

export default function InventoryPage() {
  const { state, dispatch } = useStore();
  const scope = state.currentInstitutionId;
  const resources = state.resources.filter((r) => scope === "all" || r.institutionId === scope);
  const loans = state.reservations.filter((rv) => resources.some((r) => r.id === rv.resourceId) && ["Reserved", "Collected"].includes(rv.status));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "calculator" as ResourceType, total: "5", value: "", institutionId: scope === "all" ? state.institutions[0].id : scope, loanTerm: "One semester" });
  const [err, setErr] = useState("");

  const save = () => {
    if (form.name.trim().length < 3) return setErr("Give the item a name.");
    if (!(Number(form.total) > 0)) return setErr("Quantity must be at least 1.");
    if (!(Number(form.value) > 0)) return setErr("Enter the estimated retail value.");
    dispatch(addResource({ name: form.name.trim(), type: form.type, institutionId: form.institutionId, total: Number(form.total), available: Number(form.total), retailValue: Number(form.value), loanTerm: form.loanTerm, description: `${RESOURCE_LABEL[form.type]} available on loan.`, keywords: [form.name.trim().toLowerCase()] }), { success: "Added to the lending inventory", description: "Students can reserve it in Resource Rescue now." });
    setOpen(false);
    setErr("");
    setForm({ ...form, name: "", value: "" });
  };

  return (
    <>
      <PageHeader title="Lending inventory" description="Equipment students can borrow instead of buying." actions={<Button onClick={() => setOpen(true)}><Plus /> Add item</Button>} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard label="Items in inventory" value={sum(resources.map((r) => r.total))} money={false} />
        <StatCard label="Currently on loan" value={loans.length} money={false} />
        <StatCard label="Value saved for students" value={sum(state.reservations.filter((rv) => rv.status !== "Cancelled" && resources.some((r) => r.id === rv.resourceId)).map((rv) => state.resources.find((r) => r.id === rv.resourceId)!.retailValue))} tone="primary" />
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="ps-5">Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Held by</TableHead>
                <TableHead className="text-end">Value</TableHead>
                <TableHead className="pe-5 text-end">Available / total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((r) => {
                const Icon = RESOURCE_ICON[r.type];
                return (
                  <TableRow key={r.id}>
                    <TableCell className="ps-5">
                      <span className="flex items-center gap-2.5 font-medium">
                        <Icon className="h-4 w-4 text-muted-foreground" /> {r.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{RESOURCE_LABEL[r.type]}</TableCell>
                    <TableCell className="text-muted-foreground">{institutionOf(state, r.institutionId)?.name}</TableCell>
                    <TableCell className="text-end tabular">{aed(r.retailValue)}</TableCell>
                    <TableCell className="pe-5">
                      <span className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="icon" className="h-7 w-7" aria-label={`Remove one ${r.name}`} disabled={r.available === 0} onClick={() => dispatch(adjustInventory(r.id, -1))}>
                          <Minus />
                        </Button>
                        <span className={`w-14 text-center tabular ${r.available === 0 ? "text-warning" : ""}`}>
                          {r.available} / {r.total}
                        </span>
                        <Button variant="outline" size="icon" className="h-7 w-7" aria-label={`Add one ${r.name}`} onClick={() => dispatch(adjustInventory(r.id, 1))}>
                          <Plus />
                        </Button>
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Active loans</CardTitle>
        </CardHeader>
        <CardContent>
          {loans.length === 0 ? (
            <EmptyState title="No items on loan" description="Reservations from students and BridgeEngine plans appear here." />
          ) : (
            <ul className="divide-y">
              {loans.map((rv) => {
                const r = state.resources.find((x) => x.id === rv.resourceId);
                return (
                  <li key={rv.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                    <span>
                      <span className="font-medium">{r?.name}</span> · {studentOf(state, rv.studentId)?.firstName} · pickup {fmtDate(rv.pickupDate)}
                    </span>
                    <span className="flex items-center gap-2">
                      <Badge variant={rv.status === "Reserved" ? "info" : "accent"}>{rv.status}</Badge>
                      {rv.status === "Reserved" ? (
                        <Button size="sm" variant="outline" onClick={() => dispatch(updateReservation(rv.id, "Collected"), { success: "Marked as collected" })}>
                          Mark collected
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => dispatch(updateReservation(rv.id, "Returned"), { success: "Returned to inventory" })}>
                          Mark returned
                        </Button>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a lending item</DialogTitle>
            <DialogDescription>Students will be able to reserve it straight away.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="ri-name">Item name</Label>
              <Input id="ri-name" className="mt-1.5" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Scientific calculator" />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as ResourceType })}>
                <SelectTrigger className="mt-1.5" aria-label="Category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(RESOURCE_LABEL) as ResourceType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {RESOURCE_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Institution</Label>
              <Select value={form.institutionId} onValueChange={(v) => setForm({ ...form, institutionId: v })}>
                <SelectTrigger className="mt-1.5" aria-label="Institution">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {state.institutions.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ri-qty">Quantity</Label>
              <Input id="ri-qty" className="mt-1.5 tabular" inputMode="numeric" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value.replace(/\D/g, "") })} />
            </div>
            <div>
              <Label htmlFor="ri-val">Retail value (AED)</Label>
              <Input id="ri-val" className="mt-1.5 tabular" inputMode="decimal" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value.replace(/[^\d.]/g, "") })} />
            </div>
          </div>
          <FieldError>{err}</FieldError>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Add item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
