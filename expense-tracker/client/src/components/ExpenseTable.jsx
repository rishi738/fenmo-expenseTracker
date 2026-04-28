import { Download, Pin, PinOff } from "lucide-react";
import { formatMoney } from "../utils/currency.js";
import { TableSkeleton } from "./Skeleton.jsx";

export function ExpenseTable({ expenses, loading, onTogglePin, onExport }) {
  const sortedExpenses = [...expenses].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Transactions</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Pinned expenses stay at the top.</p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-slate-800"
          type="button"
          onClick={onExport}
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Pin</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {sortedExpenses.length ? (
                sortedExpenses.map((expense) => (
                  <tr className="transition hover:bg-slate-50 dark:hover:bg-slate-800/70" key={expense.id}>
                    <td className="px-5 py-4">
                      <button
                        className={`rounded-full p-2 transition ${
                          expense.pinned
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300"
                            : "text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                        }`}
                        type="button"
                        onClick={() => onTogglePin(expense)}
                      >
                        {expense.pinned ? <Pin size={16} /> : <PinOff size={16} />}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-950 dark:text-white">
                      {formatMoney(expense.amount, expense.currency || "INR")}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                        {expense.category}
                      </span>
                    </td>
                    <td className="min-w-72 px-5 py-4 text-slate-600 dark:text-slate-300">{expense.description || "-"}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500 dark:text-slate-400">{expense.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-5 py-10 text-center text-slate-500 dark:text-slate-400" colSpan="5">
                    No expenses match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
