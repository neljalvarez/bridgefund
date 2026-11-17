"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Expense, ExpenseCategory } from "@/lib/types";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABEL, uid } from "@/lib/format";

const QUICK: { label: string; category: ExpenseCategory }[] = [
  { label: "Exam fee", category: "registration" },
  { label: "Application fee", category: "registration" },
  { label: "Bus fare", category: "travel" },
  { label: "Textbook", category: "materials" },
  { label: "Graphing calculator", category: "equipment" },
  { label: "Certified transcript copy", category: "documentation" },
  { label: "Meals", category: "food" },
];

export function ExpenseEditor({ expenses, onChange, idPrefix = "exp" }: { expenses: Expense[]; onChange: (e: Expense[]) => void; idPrefix?: string }) {
  const update = (id: string, patch: Partial<Expense>) => onChange(expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const add = (label = "", category: ExpenseCategory = "other") => onChange([...expenses, { id: uid("e"), label, category, amount: 0, confirmed: false }]);

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {expenses.map((e, i) => (
          <li key={e.id} className="grid grid-cols-2 gap-2 border-2 border-line bg-bg p-2 sm:grid-cols-[1.4fr_1fr_6rem_auto_auto] sm:items-center">
            <label className="sr-only" htmlFor={`${idPrefix}-l-${e.id}`}>
              Expense {i + 1} description
            </label>
            <input id={`${idPrefix}-l-${e.id}`} className="input col-span-2 sm:col-span-1" placeholder="e.g. Exam registration" value={e.label} onChange={(ev) => update(e.id, { label: ev.target.value })} />
            <label className="sr-only" htmlFor={`${idPrefix}-c-${e.id}`}>
              Category
            </label>
            <select id={`${idPrefix}-c-${e.id}`} className="input" value={e.category} onChange={(ev) => update(e.id, { category: ev.target.value as ExpenseCategory })}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {EXPENSE_CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
            <label className="sr-only" htmlFor={`${idPrefix}-a-${e.id}`}>
              Amount in USD
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
              <input
                id={`${idPrefix}-a-${e.id}`}
                inputMode="decimal"
                className="input pl-5"
                value={e.amount ? String(e.amount) : ""}
                placeholder="0"
                onChange={(ev) => update(e.id, { amount: Number(ev.target.value.replace(/[^\d.]/g, "")) || 0 })}
              />
            </div>
            <label className="flex items-center gap-1.5 text-xs">
              <input type="checkbox" checked={e.confirmed} onChange={(ev) => update(e.id, { confirmed: ev.target.checked })} className="h-4 w-4 accent-[#294C3D]" />
              Confirmed
            </label>
            <button type="button" onClick={() => onChange(expenses.filter((x) => x.id !== e.id))} className="justify-self-end p-1.5 text-muted hover:text-terraink" aria-label={`Remove ${e.label || "expense"}`}>
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-ghost btn-sm" onClick={() => add()}>
          <Plus size={14} /> Add expense
        </button>
        <span className="text-xs text-muted">Quick add:</span>
        {QUICK.map((q) => (
          <button key={q.label} type="button" onClick={() => add(q.label, q.category)} className="border border-line/50 bg-surface px-2 py-0.5 text-xs hover:bg-raised">
            + {q.label}
          </button>
        ))}
      </div>
    </div>
  );
}
