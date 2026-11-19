"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowRight, Loader2, Lock, PlayCircle } from "lucide-react";
import type { Role } from "@/lib/types";
import { Hydrated, useStore } from "@/lib/store";
import { setOnboarded, setRole } from "@/lib/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLE_META } from "@/components/app/nav";

const EMAIL: Record<Role, string> = { student: "mariam.demo@bridgefund.example", sponsor: "giving@ghaf-fund.example", institution: "verify@ghaf-grove.example" };

function SignIn() {
  const { dispatch } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const initial = (params.get("role") as Role) || "student";
  const [role, setR] = useState<Role>(["student", "sponsor", "institution"].includes(initial) ? initial : "student");
  const [busy, setBusy] = useState(false);
  const start = params.get("start") === "1";

  const go = () => {
    setBusy(true);
    setTimeout(() => {
      dispatch(setRole(role));
      dispatch(setOnboarded(), { success: `Signed in as ${ROLE_META[role].persona}`, description: "Simulated demo account — no registration needed." });
      router.push(ROLE_META[role].home);
    }, 500);
  };

  return (
    <div className="container flex justify-center py-16 md:py-24">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-semibold tracking-tight">{start ? "Get started with BridgeFund" : "Sign in"}</h1>
        <p className="mt-2 text-muted-foreground">Choose a demonstration account. No registration is required — accounts are simulated for competition judges.</p>
        <Card className="mt-8 p-6">
          <fieldset>
            <legend className="mb-3 text-sm font-medium">I am a…</legend>
            <div className="grid gap-2" role="radiogroup">
              {(Object.keys(ROLE_META) as Role[]).map((r) => {
                const m = ROLE_META[r];
                return (
                  <button
                    key={r}
                    type="button"
                    role="radio"
                    aria-checked={role === r}
                    onClick={() => setR(r)}
                    className={cn("flex items-center gap-3 rounded-lg border p-3 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", role === r ? "border-primary bg-primary-light/50" : "hover:bg-muted/50")}
                  >
                    <span className={cn("flex h-9 w-9 items-center justify-center rounded-md", role === r ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                      <m.icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-medium">{m.label}</span>
                      <span className="block text-xs text-muted-foreground">{m.description}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">{m.persona}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
          <div className="mt-5 space-y-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" className="mt-1.5" value={EMAIL[role]} readOnly />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" className="mt-1.5" type="password" value="demo-account" readOnly />
            </div>
          </div>
          <Button className="mt-6 w-full" size="lg" onClick={go} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : null} Continue as {ROLE_META[role].persona} {!busy && <ArrowRight />}
          </Button>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" /> Simulated authentication. No data leaves your browser.
          </p>
        </Card>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Prefer a guided tour?{" "}
          <Link href="/demo" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
            <PlayCircle className="h-3.5 w-3.5" /> Launch the interactive demo
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Hydrated fallback={<div className="container max-w-lg py-24"><Skeleton className="h-[520px] rounded-xl" /></div>}>
      <Suspense>
        <SignIn />
      </Suspense>
    </Hydrated>
  );
}
