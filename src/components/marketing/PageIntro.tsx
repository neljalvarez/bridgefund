import type { ReactNode } from "react";
import { Lattice } from "@/components/shared/Motifs";

export function PageIntro({ eyebrow, title, children, actions }: { eyebrow: string; title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="absolute inset-y-0 end-0 hidden w-[22%] border-s text-border/70 lg:block" aria-hidden>
        <Lattice />
      </div>
      <div className="container relative py-14 md:py-20">
        <p className="eyebrow flex items-center gap-3 text-primary">
          {eyebrow}
          <span className="h-px w-16 bg-border" aria-hidden />
        </p>
        <h1 className="mt-5 max-w-3xl text-[2.4rem] font-normal leading-[1.05] tracking-[-0.02em] md:text-[3.5rem]">{title}</h1>
        {children && <div className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">{children}</div>}
        {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </section>
  );
}
