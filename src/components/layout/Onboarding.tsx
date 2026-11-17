"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Gamepad2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { setOnboarded, setRole } from "@/lib/actions";
import type { Role } from "@/lib/types";
import { Modal } from "@/components/ui/Modal";
import { PixelSprite } from "@/components/pixel/PixelSprite";
import { ROLE_META } from "./nav";

const STEPS = [
  {
    sprite: "student" as const,
    title: "Small gaps block big futures",
    body: "A $110 shortfall on an exam fee can cost a student a career-changing credential. BridgeFund finds the cheapest way across that gap — before asking anyone for money.",
  },
  {
    sprite: "key" as const,
    title: "Reduce first, then fund",
    body: "BridgeEngine searches fee waivers, free alternatives, discounts, borrowable equipment and grants. Sponsors are only asked for what is genuinely left.",
  },
  {
    sprite: "chest" as const,
    title: "Explore every perspective",
    body: "Switch between Student, Sponsor and Institution at any time — no accounts needed. Everything you do updates the other views instantly.",
  },
];

export function Onboarding() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const open = !state.onboarded;
  const close = () => dispatch(setOnboarded());
  const s = STEPS[step];

  const pick = (r: Role) => {
    dispatch(setRole(r));
    close();
    router.push(ROLE_META[r].home);
  };

  return (
    <Modal open={open} onClose={close} title={`Welcome to BridgeFund · ${step + 1}/${STEPS.length}`}>
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center border-2 border-line bg-raised">
          <PixelSprite name={s.sprite} scale={s.sprite === "student" ? 5 : 7} />
        </div>
        <div>
          <h3 className="font-pixel text-xl">{s.title}</h3>
          <p className="mt-2 text-sm text-muted">{s.body}</p>
        </div>
      </div>

      {step === STEPS.length - 1 && (
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          {(Object.keys(ROLE_META) as Role[]).map((r) => {
            const m = ROLE_META[r];
            return (
              <button key={r} type="button" onClick={() => pick(r)} className="btn-ghost flex-col items-start py-3 text-left">
                <span className="flex items-center gap-1.5">
                  <m.icon size={15} /> {m.label}
                </span>
                <span className="text-xs font-normal text-muted">{m.persona}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5" aria-hidden>
          {STEPS.map((_, i) => (
            <span key={i} className={`h-2 w-6 border border-line ${i <= step ? "bg-forest" : "bg-raised"}`} />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={() => {
              close();
              router.push("/demo");
            }}
          >
            <Gamepad2 size={14} /> Start judge demo
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn-primary btn-sm" onClick={() => setStep(step + 1)}>
              Next <ArrowRight size={14} />
            </button>
          ) : (
            <button type="button" className="btn-primary btn-sm" onClick={close}>
              Explore freely
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
