import { Loader2, Plus, X } from "lucide-react";
import { currencies } from "../utils/currency.js";
import { getTodayDate } from "../utils/date.js";

export function ExpenseForm({ form, categories, submitting, isOpen, onClose, onChange, onSubmit }) {
  return (
    <div
      className={`fixed inset-0 z-40 flex items-end justify-center bg-slate-950/40 p-4 backdrop-blur-sm transition md:items-center ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Add expense"
    >
      <form
        className={`w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl transition dark:border-white/10 dark:bg-slate-900 ${
          isOpen ? "translate-y-0 scale-100" : "translate-y-4 scale-95"
        }`}
        onSubmit={onSubmit}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Add Expense</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Create a retry-safe expense with currency and date.</p>
          </div>
          <button className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800" type="button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Amount</span>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              min="0.01"
              step="0.01"
              type="number"
              value={form.amount}
              onChange={(event) => onChange("amount", event.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Currency</span>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              value={form.currency}
              onChange={(event) => onChange("currency", event.target.value)}
              required
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category</span>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              value={form.category}
              onChange={(event) => onChange("category", event.target.value)}
              required
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              <option value="Custom">Custom</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date</span>
            <input
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              max={getTodayDate()}
              type="date"
              value={form.date}
              onChange={(event) => onChange("date", event.target.value)}
              required
            />
          </label>

          {form.category === "Custom" ? (
            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Custom category</span>
              <input
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
                value={form.customCategory}
                onChange={(event) => onChange("customCategory", event.target.value)}
                required
              />
            </label>
          ) : null}

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description</span>
            <textarea
              className="mt-1 min-h-24 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
            />
          </label>
        </div>

        <button
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={submitting}
          type="submit"
        >
          {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
          {submitting ? "Saving..." : "Save expense"}
        </button>
      </form>
    </div>
  );
}
