import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

const COLS = [
  { title: "Product", links: [["How it works", "/#how-it-works"], ["BridgeEngine", "/student/engine"], ["Rescue simulator", "/simulator"], ["Impact dashboard", "/impact"], ["Opportunity marketplace", "/sponsor/marketplace"]] },
  { title: "Audiences", links: [["For students", "/#students"], ["For sponsors", "/#sponsors"], ["For institutions", "/#institutions"]] },
  { title: "Company", links: [["Why BridgeFund?", "/why"], ["Business model", "/business"], ["Global scalability", "/scale"], ["Pilot programme", "/pilot"], ["Presentation mode", "/present"], ["Interactive demo", "/demo"]] },
];

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">Small gaps. Big futures. Reducing the cost of opportunity before asking anyone to fund it.</p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <p className="text-sm font-semibold">{c.title}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {c.links.map(([l, h]) => (
                <li key={h}>
                  <Link href={h} className="hover:text-foreground">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="container flex flex-col gap-2 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} BridgeFund — competition prototype.</p>
          <p className="max-w-2xl md:text-right">All students, institutions, sponsors, programmes and figures shown are fictional demonstration data. Transactions are simulated and no real money is transferred. BridgeFund never offers loans or charges students.</p>
        </div>
      </div>
    </footer>
  );
}
