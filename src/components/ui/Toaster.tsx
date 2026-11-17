"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, Info, X } from "lucide-react";
import { useStore } from "@/lib/store";

export function Toaster() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="no-print pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            className="panel pointer-events-auto flex items-start gap-3 p-3"
            role={t.tone === "error" ? "alert" : "status"}
          >
            <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border-2 border-line ${t.tone === "success" ? "bg-forest text-onforest" : t.tone === "error" ? "bg-terra text-[#232824]" : "bg-gold text-[#232824]"}`}>
              {t.tone === "success" ? <Check size={14} /> : t.tone === "error" ? <AlertTriangle size={14} /> : <Info size={14} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-pixel text-sm">{t.title}</p>
              {t.body && <p className="text-xs text-muted">{t.body}</p>}
            </div>
            <button type="button" onClick={() => dismissToast(t.id)} aria-label="Dismiss notification" className="text-muted hover:text-ink">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
