"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Download, Printer } from "lucide-react";
import { useStore } from "@/lib/store";
import { EmptyState } from "@/components/ui/primitives";
import { ImpactReceipt, receiptData, receiptHtml } from "@/components/sponsor/ImpactReceipt";

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useStore();
  const c = state.contributions.find((x) => x.id === id && x.requestId);

  if (!c) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState title="Receipt not found" body="It may have been cleared by a demo reset." action={<Link href="/sponsor/contributions" className="btn-primary btn-sm">My contributions</Link>} />
      </div>
    );
  }

  const download = () => {
    const url = URL.createObjectURL(new Blob([receiptHtml(state, c)], { type: "text/html" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `bridgefund-receipt-${receiptData(state, c).number}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/sponsor/contributions" className="flex items-center gap-1 text-sm font-semibold hover:underline">
          <ArrowLeft size={14} /> My impact
        </Link>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost btn-sm" onClick={() => window.print()}>
            <Printer size={14} /> Print
          </button>
          <button type="button" className="btn-primary btn-sm" onClick={download}>
            <Download size={14} /> Download
          </button>
        </div>
      </div>
      <ImpactReceipt state={state} contribution={c} />
    </div>
  );
}
