"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Expense, ExpenseCategory } from "@/lib/types";
import { EXPENSE_CATEGORIES, EXPENSE_LABEL, uid } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const QUICK: { label: string; category: ExpenseCategory }[] = [
  { label: "Exam fee", category: "examination" },
  { label: "Application fee", category: "registration" },
  { label: "Bus fare", category: "transportation" },
  { label: "Textbook", category: "materials" },
  { label: "Graphing calculator", category: "equipment" },
  { label: "Certified transcript copy", category: "documentation" },
];

export function ExpenseEditor({ expenses, onChange, idPrefix = "exp" }: { expenses: Expense[]; onChange: (e: Expense[]) => void; idPrefix?: string }) {
  const update = (id: string, patch: Partial<Expense>) => onChange(expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const add = (label = "", category: ExpenseCategory = "other") => onChange([...expenses, { id: uid("e"), label, category, amount: 0, confirmed: false }]);
  return (
    <div className="space-y-3">
      {expenses.length > 0 && (
        <ul className="space-y-2">
          {expenses.map((e, i) => (
            <li key={e.id} className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/30 p-2 sm:grid-cols-[1.5fr_1fr_7rem_auto_auto] sm:items-center">
              <Input aria-label={`Expense ${i + 1} description`} className="col-span-2 sm:col-span-1" placeholder="e.g. Exam registration" value={e.label} onChange={(ev) => update(e.id, { label: ev.target.value })} />
              <Select value={e.category} onValueChange={(v) => update(e.id, { category: v as ExpenseCategory })}>
                <SelectTrigger aria-label={`Expense ${i + 1} category`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {EXPENSE_LABEL[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">AED</span>
                <Input
                  aria-label={`Expense ${i + 1} amount`}
                  inputMode="decimal"
                  className="ps-12 tabular"
                  placeholder="0"
                  value={e.amount ? String(e.amount) : ""}
                  onChange={(ev) => update(e.id, { amount: Number(ev.target.value.replace(/[^\d.]/g, "")) || 0 })}
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-muted-foreground" htmlFor={`${idPrefix}-c-${e.id}`}>
                <Checkbox id={`${idPrefix}-c-${e.id}`} checked={e.confirmed} onCheckedChange={(v) => update(e.id, { confirmed: v === true })} />
                Confirmed
              </label>
              <Button type="button" variant="ghost" size="icon" className="justify-self-end" onClick={() => onChange(expenses.filter((x) => x.id !== e.id))} aria-label={`Remove ${e.label || "expense"}`}>
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => add()}>
          <Plus /> Add expense
        </Button>
        {QUICK.map((q) => (
          <button key={q.label} type="button" onClick={() => add(q.label, q.category)} className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
            + {q.label}
          </button>
        ))}
      </div>
    </div>
  );
}
