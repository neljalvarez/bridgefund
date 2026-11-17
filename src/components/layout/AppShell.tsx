"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { useStore } from "@/lib/store";
import { setRole } from "@/lib/actions";
import type { Role } from "@/lib/types";
import { TopBar } from "./TopBar";
import { RoleSubnav } from "./RoleSubnav";
import { Footer } from "./Footer";
import { Toaster } from "@/components/ui/Toaster";
import { Onboarding } from "./Onboarding";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { state, dispatch } = useStore();
  const areaRole = (["student", "sponsor", "institution"] as Role[]).find((r) => pathname.startsWith(`/${r}`));

  useEffect(() => {
    if (areaRole && areaRole !== state.role) dispatch(setRole(areaRole));
  }, [areaRole, state.role, dispatch]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col">
        <TopBar />
        {areaRole && <RoleSubnav role={areaRole} />}
        <main id="main" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </div>
      <Toaster />
      <Onboarding />
    </MotionConfig>
  );
}
