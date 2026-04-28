import request from "supertest";
import { createApp } from "../src/app.js";

class InMemoryExpenseRepository {
  constructor() {
    this.expenses = [];
    this.nextId = 1;
  }

  async createIfNotExists(expense) {
    const existing = this.expenses.find((item) => item.request_id === expense.requestId);

    if (existing) {
      return { expense: existing, created: false };
    }

    const created = {
      id: this.nextId,
      request_id: expense.requestId,
      amount: expense.amount,
      currency: expense.currency || "INR",
      category: expense.category,
      description: expense.description,
      date: expense.date,
      pinned: Boolean(expense.pinned),
      created_at: new Date().toISOString()
    };

    this.nextId += 1;
    this.expenses.push(created);

    return { expense: created, created: true };
  }

  async list({ category, sort }) {
    return this.expenses
      .filter((expense) => !category || expense.category === category)
      .sort((a, b) => {
        const dateDiff = new Date(b.date) - new Date(a.date);
        return sort === "date_asc" ? -dateDiff : dateDiff;
      });
  }

  async updatePinned(id, pinned) {
    const expense = this.expenses.find((item) => item.id === id);

    if (!expense) {
      return null;
    }

    expense.pinned = pinned;
    return expense;
  }
}

function setup() {
  const repository = new InMemoryExpenseRepository();
  return {
    app: createApp({ expenseRepository: repository }),
    repository
  };
}

describe("expenses API", () => {
  test("POST /expenses creates an expense", async () => {
    const { app } = setup();

    const response = await request(app).post("/expenses").send({
      request_id: "req-1",
      amount: 125.5,
      currency: "USD",
      category: "Food",
      description: "Lunch",
      date: "2026-04-29"
    });

    expect(response.status).toBe(201);
    expect(response.body.expense.amount).toBe("125.50");
    expect(response.body.expense.currency).toBe("USD");
    expect(response.body.expense.category).toBe("Food");
    expect(response.body.idempotent).toBe(false);
  });

  test("POST /expenses returns existing record for duplicate request_id", async () => {
    const { app, repository } = setup();
    const payload = {
      request_id: "retry-safe-id",
      amount: 299,
      category: "Travel",
      description: "Cab",
      date: "2026-04-28"
    };

    const first = await request(app).post("/expenses").send(payload);
    const second = await request(app).post("/expenses").send(payload);

    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect(second.body.idempotent).toBe(true);
    expect(repository.expenses).toHaveLength(1);
  });

  test("POST /expenses handles concurrent duplicate retries without extra rows", async () => {
    const { app, repository } = setup();
    const payload = {
      request_id: "parallel-retry",
      amount: 450,
      category: "Bills",
      description: "Electricity",
      date: "2026-04-28"
    };

    const responses = await Promise.all([
      request(app).post("/expenses").send(payload),
      request(app).post("/expenses").send(payload),
      request(app).post("/expenses").send(payload)
    ]);

    expect(responses.map((response) => response.status).sort()).toEqual([200, 200, 201]);
    expect(repository.expenses).toHaveLength(1);
  });

  test("POST /expenses validates invalid input", async () => {
    const { app } = setup();

    const response = await request(app).post("/expenses").send({
      amount: 0,
      category: "",
      date: ""
    });

    expect(response.status).toBe(400);
    expect(response.body.errors.amount).toBe("Amount must be greater than 0.");
    expect(response.body.errors.category).toBe("Category is required.");
    expect(response.body.errors.date).toBe("Date is required.");
  });

  test("POST /expenses rejects large, over-precise, invalid, and future dates", async () => {
    const { app } = setup();

    const tooLarge = await request(app).post("/expenses").send({
      amount: 10000000000,
      category: "Food",
      date: "2026-04-28"
    });
    const overPrecise = await request(app).post("/expenses").send({
      amount: "10.999",
      category: "Food",
      date: "2026-04-28"
    });
    const invalidDate = await request(app).post("/expenses").send({
      amount: 10,
      category: "Food",
      date: "2026-02-31"
    });
    const future = await request(app).post("/expenses").send({
      amount: 10,
      category: "Food",
      date: "2999-01-01"
    });

    expect(tooLarge.status).toBe(400);
    expect(overPrecise.status).toBe(400);
    expect(invalidDate.status).toBe(400);
    expect(future.status).toBe(400);
  });

  test("POST /expenses treats SQL injection text as data", async () => {
    const { app } = setup();

    const response = await request(app).post("/expenses").send({
      request_id: "sql-text",
      amount: 10,
      category: "Food",
      description: "'; DROP TABLE expenses; --",
      date: "2026-04-28"
    });

    expect(response.status).toBe(201);
    expect(response.body.expense.description).toBe("'; DROP TABLE expenses; --");
  });

  test("GET /expenses filters by category and sorts newest first by default", async () => {
    const { app } = setup();

    await request(app).post("/expenses").send({ request_id: "one", amount: 10, category: "Food", description: "Tea", date: "2026-04-27" });
    await request(app).post("/expenses").send({ request_id: "two", amount: 20, category: "Food", description: "Dinner", date: "2026-04-29" });
    await request(app).post("/expenses").send({ request_id: "three", amount: 30, category: "Bills", description: "Internet", date: "2026-04-28" });

    const response = await request(app).get("/expenses").query({ category: "Food" });

    expect(response.status).toBe(200);
    expect(response.body.expenses.map((expense) => expense.description)).toEqual(["Dinner", "Tea"]);
  });

  test("PATCH /expenses/:id/pin updates pinned state", async () => {
    const { app } = setup();

    const created = await request(app).post("/expenses").send({
      request_id: "pin-me",
      amount: 10,
      category: "Food",
      description: "Important",
      date: "2026-04-27"
    });

    const response = await request(app).patch(`/expenses/${created.body.expense.id}/pin`).send({ pinned: true });

    expect(response.status).toBe(200);
    expect(response.body.expense.pinned).toBe(true);
  });

  test("GET /expenses handles 1000 records while preserving sort order", async () => {
    const { app, repository } = setup();

    repository.expenses = Array.from({ length: 1000 }, (_, index) => ({
      id: index + 1,
      request_id: `bulk-${index + 1}`,
      amount: "10.00",
      currency: "INR",
      category: index % 2 === 0 ? "Food" : "Bills",
      description: `Bulk ${index + 1}`,
      date: index === 999 ? "2026-04-29" : "2026-04-01",
      pinned: false,
      created_at: new Date().toISOString()
    }));
    repository.nextId = 1001;

    const response = await request(app).get("/expenses");

    expect(response.status).toBe(200);
    expect(response.body.expenses).toHaveLength(1000);
    expect(response.body.expenses[0].description).toBe("Bulk 1000");
  });
});
