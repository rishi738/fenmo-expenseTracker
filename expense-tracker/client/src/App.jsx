import { Calendar, Moon, Plus, Sparkles, Sun, TrendingUp, Wallet, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createExpense, fetchExpenses, updateExpensePinned } from "./api/expenses.js";
import { DashboardCharts } from "./components/DashboardCharts.jsx";
import { ExpenseFilters } from "./components/ExpenseFilters.jsx";
import { ExpenseForm } from "./components/ExpenseForm.jsx";
import { ExpenseTable } from "./components/ExpenseTable.jsx";
import { SummaryCard } from "./components/SummaryCard.jsx";
import { ToastStack } from "./components/ToastStack.jsx";
import { convertAmount, currencies, formatMoney, getConvertedTotal } from "./utils/currency.js";
import { exportExpensesToCsv } from "./utils/exportCsv.js";
import { formatDayLabel, formatMonthLabel, getMonthKey, getPresetRange, getTodayDate, isWithinRange } from "./utils/date.js";
import { createClientRequestId } from "./utils/requestId.js";

const baseCategories = ["Food", "Travel", "Bills", "Shopping", "Health", "Education", "Entertainment", "Rent", "Other"];
const initialForm = {
  amount: "",
  currency: "INR",
  category: "Food",
  customCategory: "",
  description: "",
  date: getTodayDate()
};
const initialFilters = { search: "", category: "", sort: "date_desc", preset: "30d", ...getPresetRange("30d") };
const MAX_AMOUNT = 9999999999.99;

function normalizeCategory(form) {
  return form.category === "Custom" ? form.customCategory.trim() : form.category;
}

function buildMonthlyData(expenses, displayCurrency) {
  const summary = expenses.reduce((items, expense) => {
    const month = getMonthKey(expense.date);
    items[month] = (items[month] || 0) + convertAmount(expense.amount, expense.currency || "INR", displayCurrency);
    return items;
  }, {});

  return Object.entries(summary)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([month, amount]) => ({ month, label: formatMonthLabel(month), amount }));
}

function buildTrendData(expenses, displayCurrency) {
  const summary = expenses.reduce((items, expense) => {
    items[expense.date] = (items[expense.date] || 0) + convertAmount(expense.amount, expense.currency || "INR", displayCurrency);
    return items;
  }, {});

  return Object.entries(summary)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, amount]) => ({ date, label: formatDayLabel(date), amount }));
}

function buildCategoryData(expenses, displayCurrency) {
  const summary = expenses.reduce((items, expense) => {
    items[expense.category] = (items[expense.category] || 0) + convertAmount(expense.amount, expense.currency || "INR", displayCurrency);
    return items;
  }, {});

  return Object.entries(summary)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({ category, amount }));
}

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [filters, setFilters] = useState(initialFilters);
  const [displayCurrency, setDisplayCurrency] = useState("INR");
  const [isDark, setIsDark] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState([]);

  function pushToast(type, message) {
    const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, type, message }]);
    setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4200);
  }

  function dismissToast(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    setLoading(true);
    setLoadError("");

    try {
      const data = await fetchExpenses({ sort: filters.sort });
      setExpenses(data);
    } catch (error) {
      const message = error.message || "Could not load expenses.";
      setLoadError(message);
      pushToast("error", message);
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(() => {
    const fromExpenses = expenses.map((expense) => expense.category).filter(Boolean);
    return Array.from(new Set([...baseCategories.filter((category) => category !== "Other"), ...fromExpenses, "Other"]));
  }, [expenses]);

  const visibleExpenses = useMemo(() => {
    return expenses
      .filter((expense) => !filters.category || expense.category === filters.category)
      .filter((expense) => !filters.search || (expense.description || "").toLowerCase().includes(filters.search.toLowerCase()))
      .filter((expense) => isWithinRange(expense.date, filters.startDate, filters.endDate))
      .sort((a, b) => {
        const dateDiff = new Date(b.date) - new Date(a.date);
        return filters.sort === "date_asc" ? -dateDiff : dateDiff;
      });
  }, [expenses, filters]);

  const total = getConvertedTotal(visibleExpenses, displayCurrency);
  const monthlyData = useMemo(() => buildMonthlyData(visibleExpenses, displayCurrency), [visibleExpenses, displayCurrency]);
  const trendData = useMemo(() => buildTrendData(visibleExpenses, displayCurrency), [visibleExpenses, displayCurrency]);
  const categoryData = useMemo(() => buildCategoryData(visibleExpenses, displayCurrency), [visibleExpenses, displayCurrency]);

  const thisMonthTotal = useMemo(() => {
    const month = getMonthKey(getTodayDate());
    const monthExpenses = expenses.filter((expense) => getMonthKey(expense.date) === month);
    return getConvertedTotal(monthExpenses, displayCurrency);
  }, [expenses, displayCurrency]);

  const insights = useMemo(() => {
    const topCategory = categoryData[0];
    const uniqueDays = new Set(visibleExpenses.map((expense) => expense.date)).size || 1;

    return {
      highestCategory: topCategory ? `${topCategory.category} (${formatMoney(topCategory.amount, displayCurrency)})` : "No data",
      averageDaily: formatMoney(total / uniqueDays, displayCurrency)
    };
  }, [categoryData, displayCurrency, total, visibleExpenses]);

  async function handleSubmit(event) {
    event.preventDefault();

    const category = normalizeCategory(form);

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT || !/^\d+(\.\d{1,2})?$/.test(String(form.amount)) || !category || !form.date || !form.currency) {
      pushToast("error", "Enter a valid amount, currency, category, and date. Amount supports up to 2 decimals.");
      return;
    }

    const requestId = createClientRequestId();
    const optimisticExpense = {
      id: `pending-${requestId}`,
      request_id: requestId,
      amount: Number(form.amount).toFixed(2),
      currency: form.currency,
      category,
      description: form.description.trim(),
      date: form.date,
      pinned: false,
      optimistic: true
    };

    setSubmitting(true);
    setExpenses((current) => [optimisticExpense, ...current]);

    try {
      const { expense, idempotent } = await createExpense({
        amount: optimisticExpense.amount,
        currency: form.currency,
        category,
        description: optimisticExpense.description,
        date: form.date,
        request_id: requestId
      });

      setExpenses((current) => current.map((item) => (item.request_id === requestId ? expense : item)));
      setForm({ ...initialForm, currency: form.currency, date: getTodayDate() });
      setIsFormOpen(false);
      pushToast("success", idempotent ? "Expense already existed. Existing record shown." : "Expense added successfully.");
    } catch (error) {
      setExpenses((current) => current.filter((item) => item.request_id !== requestId));
      pushToast("error", error.message || "Could not save expense.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTogglePin(expense) {
    if (String(expense.id).startsWith("pending-")) return;

    const nextPinned = !expense.pinned;
    setExpenses((current) => current.map((item) => (item.id === expense.id ? { ...item, pinned: nextPinned } : item)));

    try {
      const { expense: updated } = await updateExpensePinned(expense.id, nextPinned);
      setExpenses((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      pushToast("success", nextPinned ? "Expense pinned." : "Expense unpinned.");
    } catch (error) {
      setExpenses((current) => current.map((item) => (item.id === expense.id ? expense : item)));
      pushToast("error", error.message || "Could not update pinned state.");
    }
  }

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white">
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-300">
              <Sparkles size={14} /> Fintech dashboard
            </p>
            <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">Expense Tracker</h1>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 sm:block dark:border-white/10 dark:bg-slate-900 dark:text-white"
              value={displayCurrency}
              onChange={(event) => setDisplayCurrency(event.target.value)}
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code}
                </option>
              ))}
            </select>
            <button
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-slate-900 dark:text-slate-200"
              type="button"
              onClick={() => setIsDark((current) => !current)}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="hidden items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 sm:inline-flex"
              type="button"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus size={18} /> Add Expense
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="rounded-2xl bg-slate-950 p-6 text-white shadow-2xl dark:bg-gradient-to-br dark:from-slate-900 dark:to-emerald-950/70">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h2 className="text-3xl font-semibold tracking-normal sm:text-4xl">Control your spend with clarity.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Filter transactions, convert totals, pin important expenses, and inspect your spending story through clean visual analytics.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm text-slate-300">Converted visible total</p>
                <p className="mt-2 text-3xl font-semibold">{formatMoney(total, displayCurrency)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm text-slate-300">Display currency</p>
                <select
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white outline-none"
                  value={displayCurrency}
                  onChange={(event) => setDisplayCurrency(event.target.value)}
                >
                  {currencies.map((currency) => (
                    <option className="text-slate-950" key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard accent="emerald" icon={<Wallet size={20} />} label="Visible total" value={formatMoney(total, displayCurrency)} subtext="Converted using static rates" />
          <SummaryCard accent="blue" icon={<Calendar size={20} />} label="Total this month" value={formatMoney(thisMonthTotal, displayCurrency)} />
          <SummaryCard accent="amber" icon={<TrendingUp size={20} />} label="Average daily" value={insights.averageDaily} />
          <SummaryCard accent="rose" icon={<Zap size={20} />} label="Highest category" value={insights.highestCategory} />
        </section>

        <ExpenseFilters filters={filters} onChange={setFilters} categories={categories} onReset={() => setFilters(initialFilters)} />

        {loadError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900 shadow-sm dark:border-red-500/30 dark:bg-red-950/60 dark:text-red-100">
            <p className="font-semibold">Could not load expenses</p>
            <p className="mt-1 text-sm">{loadError}</p>
            <button className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700" type="button" onClick={loadExpenses}>
              Retry
            </button>
          </div>
        ) : null}

        <DashboardCharts categoryData={categoryData} monthlyData={monthlyData} trendData={trendData} displayCurrency={displayCurrency} />

        <ExpenseTable
          expenses={visibleExpenses}
          loading={loading}
          onExport={() => exportExpensesToCsv(visibleExpenses)}
          onTogglePin={handleTogglePin}
        />
      </div>

      <button
        className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-2xl shadow-emerald-500/30 transition hover:-translate-y-1 hover:bg-emerald-700 sm:hidden"
        type="button"
        onClick={() => setIsFormOpen(true)}
      >
        <Plus size={24} />
      </button>

      <ExpenseForm
        categories={baseCategories}
        form={form}
        isOpen={isFormOpen}
        submitting={submitting}
        onChange={updateForm}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
