import type { ReactNode } from "react";

interface Props {
  title: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  tone?: "forest" | "ink" | "gold" | "terra";
  as?: "section" | "div" | "article";
  id?: string;
}

const TONES = {
  forest: "bg-forest text-onforest",
  ink: "bg-ink text-bg",
  gold: "bg-gold text-[#232824]",
  terra: "bg-terra text-[#232824]",
};

/** Vintage OS-style window panel. */
export function Window({ title, icon, actions, children, className, bodyClassName, tone = "forest", as: Tag = "section", id }: Props) {
  return (
    <Tag id={id} className={`panel flex flex-col ${className ?? ""}`}>
      <div className={`flex items-center justify-between gap-2 border-b-2 border-line px-3 py-1.5 ${TONES[tone]}`}>
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex gap-1" aria-hidden>
            <span className="h-2 w-2 border border-current" />
            <span className="h-2 w-2 border border-current opacity-60" />
          </span>
          {icon}
          <h2 className="truncate font-pixel text-sm tracking-wide">{title}</h2>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      <div className={`flex-1 p-4 ${bodyClassName ?? ""}`}>{children}</div>
    </Tag>
  );
}
