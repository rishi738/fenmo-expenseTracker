const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const REQUEST_TIMEOUT_MS = 8000;
const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

async function parseJsonResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message || "Request failed.";
    const error = new Error(message);
    error.details = data.errors;
    throw error;
  }

  return data;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestWithTimeout(url, options = {}, { retries = 1, timeout = REQUEST_TIMEOUT_MS } = {}) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);

      if (RETRYABLE_STATUSES.has(response.status) && attempt < retries) {
        await wait(350 * (attempt + 1));
        continue;
      }

      return response;
    } catch (error) {
      clearTimeout(timer);
      lastError = error;

      if (attempt >= retries) {
        const friendly = new Error(error.name === "AbortError" ? "The API request timed out. Please retry." : "Could not reach the API. Please check the server.");
        friendly.cause = error;
        throw friendly;
      }

      await wait(350 * (attempt + 1));
    }
  }

  throw lastError;
}

export async function fetchExpenses({ category = "", sort = "date_desc" } = {}) {
  const params = new URLSearchParams();

  if (category) params.set("category", category);
  if (sort) params.set("sort", sort);

  const response = await requestWithTimeout(`${API_URL}/expenses?${params.toString()}`, {}, { retries: 2 });
  const data = await parseJsonResponse(response);
  return data.expenses || [];
}

export async function createExpense(expense) {
  const response = await requestWithTimeout(`${API_URL}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(expense)
  }, { retries: 1 });

  return parseJsonResponse(response);
}

export async function updateExpensePinned(id, pinned) {
  const response = await requestWithTimeout(`${API_URL}/expenses/${id}/pin`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pinned })
  }, { retries: 1 });

  return parseJsonResponse(response);
}
