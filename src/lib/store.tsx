"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { toast } from "sonner";
import type { AppState } from "./types";
import type { Action } from "./actions";
import { createSeedState } from "./seed";
import { setDisplayCurrency } from "./format";
import { DIR, t, type Locale } from "./i18n";

import { parseState, STORAGE_KEY as KEY } from "./persist";

type Feedback = { success?: string; info?: string; error?: string; description?: string };

interface StoreValue {
  state: AppState;
  dispatch: (action: Action, feedback?: Feedback) => void;
  reset: (opts?: { silent?: boolean }) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function load(): AppState {
  try {
    return parseState(localStorage.getItem(KEY)) ?? createSeedState();
  } catch {
    return createSeedState(); // storage blocked (private mode) — run in memory
  }
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
      if (e.key !== KEY) return;
      const next = parseState(e.newValue);
      if (next) setState(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const dispatch = useCallback<StoreValue["dispatch"]>((action, fb) => {
    let failed = false;
    setState((s) => {
      if (!s) return s;
      try {
        return action(s);
      } catch (err) {
        console.error("[BridgeFund] action failed", err);
        failed = true;
        return s; // never leave the demo in a half-updated state
      }
    });
    if (failed) {
      toast.error("That didn't work", { description: "Nothing was changed. Try again, or reset the demo." });
      return;
    }
    if (fb?.success) toast.success(fb.success, { description: fb.description });
    else if (fb?.info) toast(fb.info, { description: fb.description });
    else if (fb?.error) toast.error(fb.error, { description: fb.description });
  }, []);

  const reset = useCallback((opts?: { silent?: boolean }) => {
    // Reset demo data, but keep preferences and anything real the user entered (pilot results, feedback).
    setState((s) => ({ ...createSeedState(), onboarded: true, profile: s?.profile ?? createSeedState().profile, display: s?.display ?? createSeedState().display, pilot: s?.pilot ?? createSeedState().pilot, feedback: s?.feedback ?? [] }));
    if (!opts?.silent) toast.success("Demo reset", { description: "All demonstration data has been restored." });
  }, []);

  if (state) setDisplayCurrency(state.display.currency); // display-only conversion; calculations stay in AED
  const locale = state?.display.locale ?? "en";
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = DIR[locale];
  }, [locale]);
  const value = useMemo(() => (state ? { state, dispatch, reset } : null), [state, dispatch, reset]);
  return (
    <StoreContext.Provider value={value}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </StoreContext.Provider>
  );
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

/** Current interface language; safe to call before demo data has loaded. */
export function useLocale(): Locale {
  return useContext(StoreContext)?.state.display.locale ?? "en";
}

/** Translate an interface string for the current language. */
export function useT() {
  const locale = useLocale();
  return (key: string) => t(locale, key);
}

/** Like useStore, but returns null before demo data has loaded (safe on public pages). */
export function useMaybeStore() {
  return useContext(StoreContext);
}
