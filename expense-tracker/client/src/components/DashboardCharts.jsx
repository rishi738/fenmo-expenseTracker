import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatMoney } from "../utils/currency.js";

const chartColors = ["#10b981", "#2563eb", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6", "#f97316", "#64748b"];

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      <div className="h-72">{children}</div>
    </div>
  );
}

function EmptyChart({ children }) {
  return (
    <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
      {children}
    </div>
  );
}

export function DashboardCharts({ categoryData, monthlyData, trendData, displayCurrency }) {
  return (
    <section className="grid gap-5 xl:grid-cols-3">
      <ChartCard title="Category Mix" subtitle="Converted share by category">
        {categoryData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryData} dataKey="amount" nameKey="category" innerRadius={58} outerRadius={92} paddingAngle={3}>
                {categoryData.map((entry, index) => (
                  <Cell fill={chartColors[index % chartColors.length]} key={entry.category} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatMoney(value, displayCurrency)} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart>No category data yet</EmptyChart>
        )}
      </ChartCard>

      <ChartCard title="Monthly Expenses" subtitle="Converted monthly totals">
        {monthlyData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => Math.round(value)} width={42} />
              <Tooltip formatter={(value) => formatMoney(value, displayCurrency)} />
              <Bar dataKey="amount" radius={[10, 10, 0, 0]} fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart>No monthly data yet</EmptyChart>
        )}
      </ChartCard>

      <ChartCard title="Spending Trend" subtitle="Daily converted movement">
        {trendData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => Math.round(value)} width={42} />
              <Tooltip formatter={(value) => formatMoney(value, displayCurrency)} />
              <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart>No trend data yet</EmptyChart>
        )}
      </ChartCard>
    </section>
  );
}
