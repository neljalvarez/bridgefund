"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { inInstitutionScope } from "@/lib/selectors";
import { fmtDateTime, usd } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, PageHeader } from "@/components/shared/kit";

export default function AuditPage() {
  const { state } = useStore();
  const [actor, setActor] = useState("all");
  const [q, setQ] = useState("");

  const events = useMemo(
    () =>
      state.requests
        .filter((r) => inInstitutionScope(state, r))
        .flatMap((r) => r.history.map((h) => ({ ...h, ref: r.ref, id: `${r.id}-${h.at}-${h.note}` })))
        .sort((a, b) => b.at.localeCompare(a.at)),
    [state],
  );
  const list = events.filter((e) => (actor === "all" || e.actor === actor) && (!q || `${e.ref} ${e.note} ${e.status}`.toLowerCase().includes(q.toLowerCase())));
  const payments = state.payments.filter((p) => inInstitutionScope(state, state.requests.find((r) => r.id === p.requestId)!));

  const exportCsv = () => {
    const rows = [["Timestamp", "Request", "Actor", "Status", "Event"], ...list.map((e) => [e.at, e.ref, e.actor, e.status, e.note])];
    const url = URL.createObjectURL(new Blob([rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "bridgefund-audit-log.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader title="Audit log" description="Every check, decision and payment, timestamped." actions={<Button variant="outline" onClick={exportCsv}><Download /> Export CSV</Button>} />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Provider payments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <p className="px-5 pb-5 text-sm text-muted-foreground">No payments yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Date</TableHead>
                  <TableHead>Request</TableHead>
                  <TableHead>Paid to (verified provider)</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="pr-5 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="pl-5 text-muted-foreground">{fmtDateTime(p.at)}</TableCell>
                    <TableCell>{state.requests.find((r) => r.id === p.requestId)?.ref}</TableCell>
                    <TableCell>
                      {p.provider} <Badge variant="outline" className="ml-1 border-dashed">Simulated</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{p.reference}</TableCell>
                    <TableCell className="pr-5 text-right tabular">{usd(p.amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <p className="px-5 py-3 text-xs text-muted-foreground">BridgeFund pays verified education providers directly. It never transfers unrestricted cash to student accounts.</p>
        </CardContent>
      </Card>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Search the audit log" className="pl-9" placeholder="Search by reference or event…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={actor} onValueChange={setActor}>
          <SelectTrigger className="sm:w-48" aria-label="Actor">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actors</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="institution">Institution</SelectItem>
            <SelectItem value="sponsor">Sponsor</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {list.length === 0 ? (
        <EmptyState title="No events match" />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Timestamp</TableHead>
                <TableHead>Request</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Event</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.slice(0, 200).map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="whitespace-nowrap pl-5 text-muted-foreground">{fmtDateTime(e.at)}</TableCell>
                  <TableCell className="font-medium">{e.ref}</TableCell>
                  <TableCell>
                    <Badge variant="neutral" className="capitalize">
                      {e.actor}
                    </Badge>
                  </TableCell>
                  <TableCell>{e.note}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </>
  );
}
