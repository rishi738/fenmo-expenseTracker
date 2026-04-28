import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import App from "./App.jsx";
import { createExpense, fetchExpenses, updateExpensePinned } from "./api/expenses.js";

vi.mock("./api/expenses.js", () => ({
  createExpense: vi.fn(),
  fetchExpenses: vi.fn(),
  updateExpensePinned: vi.fn()
}));

vi.mock("./components/DashboardCharts.jsx", () => ({
  DashboardCharts: () => <div data-testid="charts">Charts</div>
}));

const expenses = [
  {
    id: 1,
    request_id: "a",
    amount: "100.00",
    currency: "INR",
    category: "Food",
    description: "Lunch",
    date: "2026-04-29",
    pinned: false
  },
  {
    id: 2,
    request_id: "b",
    amount: "45.00",
    currency: "USD",
    category: "Travel",
    description: "Cab ride",
    date: "2026-04-25",
    pinned: false
  }
];

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchExpenses.mockResolvedValue(expenses);
    updateExpensePinned.mockResolvedValue({ expense: { ...expenses[0], pinned: true } });
  });

  test("renders expenses returned by the API", async () => {
    render(<App />);

    expect(await screen.findByText("Lunch")).toBeInTheDocument();
    expect(screen.getByText("Cab ride")).toBeInTheDocument();
    expect(screen.getByText("Charts")).toBeInTheDocument();
  });

  test("shows graceful error UI when loading fails", async () => {
    fetchExpenses.mockRejectedValueOnce(new Error("Could not reach the API. Please check the server."));

    render(<App />);

    expect(await screen.findByText("Could not load expenses")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  test("submits the add expense form", async () => {
    const user = userEvent.setup();
    createExpense.mockResolvedValue({
      expense: {
        id: 3,
        request_id: "new",
        amount: "75.00",
        currency: "INR",
        category: "Food",
        description: "Snacks",
        date: "2026-04-29",
        pinned: false
      },
      idempotent: false
    });

    render(<App />);
    await screen.findByText("Lunch");
    await user.click(screen.getByRole("button", { name: /add expense/i }));

    const dialog = screen.getByRole("dialog", { name: /add expense/i });
    await user.type(within(dialog).getByLabelText(/amount/i), "75");
    await user.type(within(dialog).getByLabelText(/description/i), "Snacks");
    await user.click(within(dialog).getByRole("button", { name: /save expense/i }));

    expect(createExpense).toHaveBeenCalledWith(expect.objectContaining({
      amount: "75.00",
      category: "Food",
      description: "Snacks",
      currency: "INR"
    }));
    expect(await screen.findByText("Expense added successfully.")).toBeInTheDocument();
  });

  test("shows frontend validation errors", async () => {
    const user = userEvent.setup();

    render(<App />);
    await screen.findByText("Lunch");
    await user.click(screen.getByRole("button", { name: /add expense/i }));

    const dialog = screen.getByRole("dialog", { name: /add expense/i });
    await user.clear(within(dialog).getByLabelText(/amount/i));
    await user.type(within(dialog).getByLabelText(/amount/i), "10000000000");
    await user.click(within(dialog).getByRole("button", { name: /save expense/i }));

    expect(await screen.findByText(/enter a valid amount/i)).toBeInTheDocument();
    expect(createExpense).not.toHaveBeenCalled();
  });

  test("filters expenses by description search", async () => {
    const user = userEvent.setup();

    render(<App />);
    expect(await screen.findByText("Lunch")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/description/i), "Cab");

    expect(screen.getByText("Cab ride")).toBeInTheDocument();
    expect(screen.queryByText("Lunch")).not.toBeInTheDocument();
  });
});
