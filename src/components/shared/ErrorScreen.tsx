"use client";

import { useEffect } from "react";
import { RotateCcw, RefreshCw } from "lucide-react";

/** Shown if a page throws. Offers a retry and a clean demo reset — never a blank screen on stage. */
export function ErrorScreen({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => console.error("[BridgeFund]", error), [error]);
  const resetDemo = () => {
    try {
      localStorage.removeItem("bridgefund-state");
    } catch {
      /* storage unavailable */
    }
    window.location.assign("/");
  };
  return (
    <main id="main" className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow text-primary">Something went wrong</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">This page couldn&apos;t load.</h1>
      <p className="mt-2 max-w-md text-muted-foreground">Your demo data is safe. Try again, or restore the original demonstration data.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={retry} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
        <button type="button" onClick={resetDemo} className="inline-flex h-10 items-center gap-2 rounded-lg border bg-card px-4 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <RotateCcw className="h-4 w-4" /> Reset demo
        </button>
      </div>
    </main>
  );
}
