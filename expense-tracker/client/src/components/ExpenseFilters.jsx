import { CalendarDays, Search } from "lucide-react";
import { getPresetRange, getTodayDate } from "../utils/date.js";

export function ExpenseFilters({ filters, onChange, categories, onReset }) {
  function applyPreset(preset) {
    onChange({ ...filters, preset, ...getPresetRange(preset) });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className="grid gap-3 xl:grid-cols-[1.2fr_1fr_1fr]">
        <label className="block">
          <span className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            <Search size={14} /> Search
          </span>
          <input
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
            placeholder="Description..."
            value={filters.search}
            onChange={(event) => onChange({ ...filters, search: event.target.value })}
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Category</span>
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
            value={filters.category}
            onChange={(event) => onChange({ ...filters, category: event.target.value })}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Sort</span>
          <select
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
            value={filters.sort}
            onChange={(event) => onChange({ ...filters, sort: event.target.value })}
          >
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[auto_1fr_1fr] xl:items-end">
        <div>
          <span className="mb-1 flex items-center gap-1 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            <CalendarDays size={14} /> Date range
          </span>
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-950">
            {[
              ["today", "Today"],
              ["7d", "7 days"],
              ["30d", "30 days"]
            ].map(([value, label]) => (
              <button
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  filters.preset === value
                    ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
                key={value}
                type="button"
                onClick={() => applyPreset(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">From</span>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
            max={filters.endDate || getTodayDate()}
            type="date"
            value={filters.startDate}
            onChange={(event) => onChange({ ...filters, preset: "custom", startDate: event.target.value })}
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">To</span>
          <input
            className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-slate-950 dark:text-white"
            max={getTodayDate()}
            min={filters.startDate || undefined}
            type="date"
            value={filters.endDate}
            onChange={(event) => onChange({ ...filters, preset: "custom", endDate: event.target.value })}
          />
        </label>
      </div>
      <button
        className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-slate-800"
        type="button"
        onClick={onReset}
      >
        Reset filters
      </button>
    </div>
  );
}
