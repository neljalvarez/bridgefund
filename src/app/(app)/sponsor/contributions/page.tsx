"use client";

import Link from "next/link";
import { useState } from "react";
import { Receipt } from "lucide-react";
import { useStore } from "@/lib/store";
import { contributeToPool, currentSponsor } from "@/lib/actions";
import { fmtDate, usd } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, PageHeader, StatusBadge } from "@/components/shared/kit";

export default function SponsorContributionsPage() {
  const { state, dispatch } = useStore();
  const sponsor = currentSponsor(state);
  const [filter, setFilter] = useState("all");
  const [poolAmt, setPoolAmt] = useState("50");
  const mine = state.contributions.filter((c) => c.sponsorId === sponsor.id);
  const rows = mine.filter((c) => {
    if (filter === "all") return true;
    const r = state.requests.find((x) => x.id === c.requestId);
    if (filter === "pool") return !c.requestId;
    if (filter === "completed") return r?.status === "Completed";
    return r && r.status !== "Completed";
  });
  const poolV = Number(poolAmt);
  const poolErr = !(poolV > 0) || poolV > sponsor.balance;

  return (
    <>
      <PageHeader title="My contributions" description="Every contribution and its receipt." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
            <div>
              <CardTitle>History</CardTitle>
              
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[170px]" aria-label="Filter contributions">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All contributions</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pool">Shared pool</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-0">
            {rows.length === 0 ? (
              <div className="p-5">
                <EmptyState title="No contributions in this view" action={<Button asChild variant="outline"><Link href="/sponsor/marketplace">Find a need to support</Link></Button>} />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5">Date</TableHead>
                    <TableHead>Need</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-5 text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((c) => {
                    const r = state.requests.find((x) => x.id === c.requestId);
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="pl-5 text-muted-foreground">{fmtDate(c.at)}</TableCell>
                        <TableCell className="max-w-[240px] truncate">{r ? `${r.ref} · ${r.purpose}` : "Shared opportunity pool"}</TableCell>
                        <TableCell className="text-right font-medium tabular">{usd(c.amount)}</TableCell>
                        <TableCell>{r ? <StatusBadge status={r.status} /> : <span className="text-xs text-muted-foreground">Pooled</span>}</TableCell>
                        <TableCell className="pr-5 text-right">
                          {r && (
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/receipt/${c.id}`}>
                                <Receipt /> View
                              </Link>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shared opportunity pool</CardTitle>
              <CardDescription>Schools use it for their most urgent needs. Balance {usd(state.pool)}.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!poolErr) dispatch(contributeToPool(poolV), { success: `${usd(poolV)} added to the shared pool` });
                }}
              >
                <Input aria-label="Pool contribution" className="tabular" inputMode="decimal" value={poolAmt} onChange={(e) => setPoolAmt(e.target.value.replace(/[^\d.]/g, ""))} />
                <Button type="submit" variant="outline" disabled={poolErr}>
                  Add
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
