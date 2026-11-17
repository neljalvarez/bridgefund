"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/types";
import { ROLE_META, ROLE_NAV } from "./nav";

export function RoleSubnav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = ROLE_NAV[role];
  const meta = ROLE_META[role];
  return (
    <nav aria-label={`${meta.label} navigation`} className="no-print border-b-2 border-line bg-raised/60">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4">
        <span className="hidden shrink-0 items-center gap-1.5 border-r-2 border-line py-2 pr-3 font-pixel text-xs uppercase tracking-wider text-muted lg:flex">
          <meta.icon size={14} aria-hidden /> {meta.label}
        </span>
        <ul className="scrollbar-thin -mb-[2px] flex gap-1 overflow-x-auto py-1.5">
          {items.map((item) => {
            const active = item.href === `/${role}` ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-1.5 whitespace-nowrap border-2 px-2.5 py-1 text-xs font-semibold transition-colors ${
                    active ? "border-line bg-surface shadow-offset-sm" : "border-transparent text-muted hover:border-line/40 hover:text-ink"
                  }`}
                >
                  <item.icon size={14} aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
