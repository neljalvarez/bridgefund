import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

const COLS = [
  { title: "Product", links: [["How it works", "/#how-it-works"], ["Interactive demo", "/demo"], ["Rescue simulator", "/simulator"], ["Impact", "/impact"]] },
  { title: "Company", links: [["Why BridgeFund", "/why"], ["Business model", "/business"], ["UAE expansion", "/scale"], ["UAE pilot", "/pilot"]] },
  { title: "Get started", links: [["Sign in", "/signin"], ["Presentation mode", "/present"]] },
];

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">Small gaps. Big futures.</p>
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
          <p className="max-w-xl md:text-end">Students, schools, sponsors and transactions are fictional; payments are simulated and would require UAE regulatory review and authorised partners. UAE programmes listed are real but not affiliated. Students never pay.</p>
        </div>
      </div>
    </footer>
  );
}
