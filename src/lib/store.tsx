"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { AppState } from "./types";
import type { Action } from "./actions";
import { createSeedState, STATE_VERSION } from "./seed";

const KEY = "bridgefund-state";

type Feedback = { success?: string; info?: string; error?: string; description?: string };

interface StoreValue {
  state: AppState;
  dispatch: (action: Action, feedback?: Feedback) => void;
  reset: () => void;
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
    /* corrupted storage — start fresh */
  }
  return createSeedState();
}

/** Demo state lives in localStorage. Nothing is sent to a server. */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => setState(load()), []);

  useEffect(() => {
    if (!state) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — demo continues in memory */
    }
  }, [state]);

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

  const dispatch = useCallback<StoreValue["dispatch"]>((action, fb) => {
    setState((s) => (s ? action(s) : s));
    if (fb?.success) toast.success(fb.success, { description: fb.description });
    else if (fb?.info) toast(fb.info, { description: fb.description });
    else if (fb?.error) toast.error(fb.error, { description: fb.description });
  }, []);

  const reset = useCallback(() => {
    setState((s) => ({ ...createSeedState(), onboarded: true, profile: s?.profile ?? createSeedState().profile }));
    toast("Demo reset", { description: "All demonstration data has been restored." });
  }, []);

  const value = useMemo(() => (state ? { state, dispatch, reset } : null), [state, dispatch, reset]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <Hydrated>");
  return ctx;
}

export const useHydrated = () => useContext(StoreContext) !== null;

/** Renders children only once demo data has loaded from localStorage. */
export function Hydrated({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return useHydrated() ? <>{children}</> : <>{fallback}</>;
}
