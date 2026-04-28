import crypto from "node:crypto";

export function createRequestHash({ amount, currency = "INR", category, description = "", date }) {
  const normalized = {
    amount: Number(amount).toFixed(2),
    currency: String(currency || "INR").trim().toUpperCase(),
    category: String(category || "").trim().toLowerCase(),
    description: String(description || "").trim(),
    date
  };

  return crypto.createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
}
