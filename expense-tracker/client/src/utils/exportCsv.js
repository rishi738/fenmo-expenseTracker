export function exportExpensesToCsv(expenses) {
  const headers = ["Amount", "Currency", "Category", "Description", "Date", "Pinned"];
  const rows = expenses.map((expense) => [
    expense.amount,
    expense.currency || "INR",
    expense.category,
    expense.description || "",
    expense.date,
    expense.pinned ? "Yes" : "No"
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
