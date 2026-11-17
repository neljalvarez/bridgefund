"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/kit";
import { ImpactReceipt, receiptData, receiptHtml } from "@/components/sponsor/ImpactReceipt";

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useStore();
  const c = state.contributions.find((x) => x.id === id && x.requestId);
  if (!c) return <EmptyState title="Receipt not found" description="It may have been cleared by a demo reset." action={<Button asChild><Link href="/sponsor">Sponsor dashboard</Link></Button>} />;

  const download = () => {
    const url = URL.createObjectURL(new Blob([receiptHtml(state, c)], { type: "text/html" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `bridgefund-receipt-${receiptData(state, c).number}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="no-print mx-auto mb-6 flex max-w-2xl flex-wrap items-center justify-between gap-3">
        <Link href={state.role === "student" ? "/student/requests" : "/sponsor"} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer /> Print
          </Button>
          <Button size="sm" onClick={download}>
            <Download /> Download
          </Button>
        </div>
      </div>
      <ImpactReceipt state={state} contribution={c} />
    </>
  );
}
