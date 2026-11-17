import { Check } from "lucide-react";
import type { RequestStatus } from "@/lib/types";
import { STATUS_FLOW } from "@/lib/format";

export function StatusTrack({ status }: { status: RequestStatus }) {
  const idx = STATUS_FLOW.indexOf(status);
  if (status === "Declined") {
    return <p className="border-2 border-dashed border-line/50 px-3 py-2 text-sm text-muted">This request was not approved. Your institution can suggest other options.</p>;
  }
  return (
    <ol className="grid grid-cols-7 gap-1" aria-label={`Status: ${status}`}>
      {STATUS_FLOW.map((s, i) => {
        const done = i < idx;
        const current = i === idx;
        return (
          <li key={s} className="flex flex-col items-center gap-1 text-center" aria-current={current ? "step" : undefined}>
            <span className={`flex h-6 w-full items-center justify-center border-2 border-line ${done ? "bg-forest text-onforest" : current ? "bg-gold text-[#232824]" : "bg-raised text-muted"}`}>
              {done ? <Check size={12} aria-hidden /> : <span className="font-pixel text-[11px]">{i + 1}</span>}
            </span>
            <span className={`text-[9px] font-semibold uppercase leading-tight tracking-wide sm:text-[10px] ${current ? "text-ink" : "text-muted"}`}>{s}</span>
          </li>
        );
      })}
    </ol>
  );
}
