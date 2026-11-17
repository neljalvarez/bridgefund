"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { AppState } from "./types";
import type { Action } from "./actions";
import { createSeedState, STATE_VERSION } from "./seed";
import { playCue } from "./sound";

const KEY = "bridgefund-demo-state";

interface Toast {
  id: number;
  title: string;
  body?: string;
  tone: "success" | "info" | "error";
}

interface StoreValue {
  state: AppState;
  dispatch: (action: Action, feedback?: { toast?: Omit<Toast, "id">; sound?: Parameters<typeof playCue>[0] }) => void;
  reset: () => void;
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
  hydrated: boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed.version === STATE_VERSION) return parsed;
    }
  } catch {
    /* corrupted storage — fall through to a fresh seed */
  }
  return createSeedState();
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  useEffect(() => {
    setState(load());
  }, []);

  useEffect(() => {
    if (!state) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable — demo continues in memory */
    }
  }, [state]);

  // keep tabs in sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) {
        try {
          setState(JSON.parse(e.newValue));
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = ++seq.current;
    setToasts((xs) => [...xs.slice(-3), { ...t, id }]);
    setTimeout(() => setToasts((xs) => xs.filter((x) => x.id !== id)), 4200);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts((xs) => xs.filter((x) => x.id !== id)), []);

  const soundOn = state?.sound ?? false;
  const dispatch = useCallback<StoreValue["dispatch"]>(
    (action, feedback) => {
      setState((s) => (s ? action(s) : s));
      if (feedback?.toast) toast(feedback.toast);
      if (feedback?.sound) playCue(feedback.sound, soundOn);
    },
    [toast, soundOn],
  );

  const reset = useCallback(() => {
    const fresh = createSeedState();
    setState((s) => ({ ...fresh, onboarded: true, sound: s?.sound ?? false }));
    toast({ title: "Demo reset", body: "All demo data restored to its starting point.", tone: "info" });
  }, [toast]);

  const value = useMemo<StoreValue | null>(
    () => (state ? { state, dispatch, reset, toasts, toast, dismissToast, hydrated: true } : null),
    [state, dispatch, reset, toasts, toast, dismissToast],
  );

  if (!value) return <BootScreen />;
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function BootScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="h-3 w-3 bg-forest" style={{ animation: `blink 1s steps(1) ${i * 0.15}s infinite` }} />
          ))}
        </div>
        <p className="font-pixel text-sm text-muted">Loading BridgeFund…</p>
      </div>
    </div>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
