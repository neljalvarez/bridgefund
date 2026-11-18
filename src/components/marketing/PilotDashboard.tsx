"use client";

import { useState } from "react";
import { ClipboardList, Download, Pencil } from "lucide-react";
import { downloadCsv, feedbackRows, pilotRows } from "@/lib/csv";
import { Hydrated, useStore } from "@/lib/store";
import { setPilot } from "@/lib/actions";
import { fmtDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/shared/kit";

type Pilot = { schools: number; students: number; requests: number; resolved: number; participated: number; avgDaysToResolve: number | null; notes: string };
const FIELDS: { key: Exclude<keyof Pilot, "notes">; label: string; help: string }[] = [
  { key: "schools", label: "Partner institutions", help: "Signed pilot agreements" },
  { key: "students", label: "Students onboarded", help: "With consent recorded" },
  { key: "requests", label: "Requests verified", help: "Checked by staff" },
  { key: "resolved", label: "Barriers resolved", help: "Fully funded requests" },
  { key: "participated", label: "Students who took part", help: "Recorded by the institution" },
  { key: "avgDaysToResolve", label: "Average days to resolve", help: "Submission → fully funded" },
];

function Dashboard() {
  const { state, dispatch } = useStore();
  const p = state.pilot;
  const empty = !p.updatedAt;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const open = () => {
    setForm(Object.fromEntries([...FIELDS.map((f) => [f.key, p[f.key] === null ? "" : String(p[f.key])]), ["notes", p.notes]]));
    setEditing(true);
  };
  const num = (k: string) => (form[k] === "" || form[k] === undefined ? null : Number(form[k]));
  const errors: Record<string, string> = {};
  FIELDS.forEach((f) => {
    const v = num(f.key);
    if (v !== null && (!Number.isFinite(v) || v < 0)) errors[f.key] = "Enter zero or a positive number.";
  });
  if ((num("resolved") ?? 0) > (num("requests") ?? 0)) errors.resolved = "Cannot exceed requests verified.";
  if ((num("participated") ?? 0) > (num("resolved") ?? 0)) errors.participated = "Cannot exceed barriers resolved.";
  const valid = Object.keys(errors).length === 0;

  const save = () => {
    dispatch(
      setPilot({
        schools: num("schools") ?? 0,
        students: num("students") ?? 0,
        requests: num("requests") ?? 0,
        resolved: num("resolved") ?? 0,
        participated: num("participated") ?? 0,
        avgDaysToResolve: num("avgDaysToResolve"),
        notes: form.notes ?? "",
      }),
      { success: "Pilot results saved", description: "Stored in this browser only." },
    );
    setEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Pilot results dashboard</CardTitle>
          <CardDescription className="mt-1">{empty ? "No pilot has started. This dashboard is ready to track verified results once one does." : `Last updated ${fmtDateTime(p.updatedAt!)} · entered manually, stored in this browser`}</CardDescription>
        </div>
        {!editing && (
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => downloadCsv("bridgefund-pilot-metrics.csv", pilotRows(state))}>
              <Download /> Metrics CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={() => downloadCsv("bridgefund-feedback.csv", feedbackRows(state))}>
              <Download /> Feedback CSV ({state.feedback.length})
            </Button>
            <Button variant="outline" size="sm" onClick={open}>
              <Pencil /> {empty ? "Record results" : "Update"}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {editing ? (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (valid) save();
            }}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FIELDS.map((f) => (
                <div key={f.key}>
                  <Label htmlFor={`pilot-${f.key}`}>{f.label}</Label>
                  <Input id={`pilot-${f.key}`} inputMode="decimal" className="mt-1.5 tabular" value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value.replace(/[^\d.]/g, "") })} aria-invalid={!!errors[f.key]} />
                  <FieldError>{errors[f.key]}</FieldError>
                  {!errors[f.key] && <p className="mt-1 text-xs text-muted-foreground">{f.help}</p>}
                </div>
              ))}
            </div>
            <div>
              <Label htmlFor="pilot-notes">Notes and evidence sources</Label>
              <Textarea id="pilot-notes" className="mt-1.5" rows={3} placeholder="e.g. where these figures come from and who verified them" value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <p className="text-xs text-muted-foreground">Only record results from a real pilot that have been verified. Never enter estimates here.</p>
            <div className="flex gap-2">
              <Button type="submit" disabled={!valid}>
                Save results
              </Button>
              <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : empty ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-10 text-center">
            <ClipboardList className="h-6 w-6 text-muted-foreground" />
            <p className="font-medium">Awaiting real pilot data</p>
            <p className="max-w-md text-sm text-muted-foreground">Nothing here is simulated. Metrics appear only when a pilot team records verified results.</p>
          </div>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {FIELDS.map((f) => (
                <div key={f.key} className="rounded-lg border p-3">
                  <dt className="text-xs text-muted-foreground">{f.label}</dt>
                  <dd className="mt-1 text-xl font-semibold tabular">{p[f.key] ?? "—"}</dd>
                </div>
              ))}
            </dl>
            {p.notes && <p className="mt-4 whitespace-pre-line rounded-lg bg-muted/50 p-3 text-sm">{p.notes}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function PilotDashboard() {
  return (
    <Hydrated fallback={<Skeleton className="h-64 rounded-xl" />}>
      <Dashboard />
    </Hydrated>
  );
}
