export const supportedCurrencies = [
  "USD",
  "EUR",
  "GBP",
  "INR",
  "JPY",
  "CNY",
  "AUD",
  "CAD",
  "CHF",
  "SGD",
  "AED",
  "SAR",
  "NZD",
  "ZAR",
  "BRL",
  "MXN",
  "HKD",
  "SEK",
  "NOK",
  "KRW"
];

const MAX_AMOUNT = 9999999999.99;
const MAX_CATEGORY_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;

function isRealDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;

  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

export function validateExpensePayload(payload) {
  const errors = {};
  const amount = Number(payload.amount);
  const currency = String(payload.currency || "INR").trim().toUpperCase();
  const category = String(payload.category || "").trim();
  const description = String(payload.description || "").trim();
  const date = String(payload.date || "").trim();

  if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Amount must be greater than 0.";
  } else if (amount > MAX_AMOUNT) {
    errors.amount = "Amount is too large.";
  } else if (!/^\d+(\.\d{1,2})?$/.test(String(payload.amount))) {
    errors.amount = "Amount can have at most 2 decimal places.";
  }

  if (!category) {
    errors.category = "Category is required.";
  } else if (category.length > MAX_CATEGORY_LENGTH) {
    errors.category = "Category must be 100 characters or less.";
  }

  if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = "Description must be 1000 characters or less.";
  }

  if (!supportedCurrencies.includes(currency)) {
    errors.currency = "Currency is not supported.";
  }

  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");

  if (!date) {
    errors.date = "Date is required.";
  } else if (!isRealDate(date)) {
    errors.date = "Date must use YYYY-MM-DD format.";
  } else if (date > todayString) {
    errors.date = "Date cannot be in the future.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: {
      amount: Number.isFinite(amount) ? amount.toFixed(2) : payload.amount,
      currency,
      category,
      description,
      date
    }
  };
}
