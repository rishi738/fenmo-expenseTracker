export function SummaryCard({ icon, label, value, accent = "emerald", subtext }) {
  const accents = {
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-300",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-300",
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-300"
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/80">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
          {subtext ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtext}</p> : null}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accents[accent]}`}>{icon}</div>
      </div>
    </div>
  );
}
