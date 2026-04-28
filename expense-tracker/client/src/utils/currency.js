export const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar", locale: "en-US", rateToUSD: 1 },
  { code: "EUR", symbol: "€", name: "Euro", locale: "de-DE", rateToUSD: 1.08 },
  { code: "GBP", symbol: "£", name: "British Pound", locale: "en-GB", rateToUSD: 1.27 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", locale: "en-IN", rateToUSD: 0.012 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", locale: "ja-JP", rateToUSD: 0.0065 },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", locale: "zh-CN", rateToUSD: 0.14 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", locale: "en-AU", rateToUSD: 0.66 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", locale: "en-CA", rateToUSD: 0.73 },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", locale: "de-CH", rateToUSD: 1.1 },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", locale: "en-SG", rateToUSD: 0.74 },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", locale: "en-AE", rateToUSD: 0.27 },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", locale: "ar-SA", rateToUSD: 0.27 },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", locale: "en-NZ", rateToUSD: 0.61 },
  { code: "ZAR", symbol: "R", name: "South African Rand", locale: "en-ZA", rateToUSD: 0.054 },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", locale: "pt-BR", rateToUSD: 0.2 },
  { code: "MXN", symbol: "$", name: "Mexican Peso", locale: "es-MX", rateToUSD: 0.059 },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", locale: "zh-HK", rateToUSD: 0.13 },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", locale: "sv-SE", rateToUSD: 0.095 },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", locale: "nb-NO", rateToUSD: 0.093 },
  { code: "KRW", symbol: "₩", name: "South Korean Won", locale: "ko-KR", rateToUSD: 0.00073 }
];

export function getCurrency(code = "INR") {
  return currencies.find((currency) => currency.code === code) || currencies[3];
}

export function formatMoney(value, currencyCode = "INR") {
  const currency = getCurrency(currencyCode);

  return new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
    maximumFractionDigits: currency.code === "JPY" || currency.code === "KRW" ? 0 : 2
  }).format(Number(value || 0));
}

export function convertAmount(amount, fromCurrency = "INR", toCurrency = "INR") {
  const from = getCurrency(fromCurrency);
  const to = getCurrency(toCurrency);
  const amountInUsd = Number(amount || 0) * from.rateToUSD;
  return amountInUsd / to.rateToUSD;
}

export function getConvertedTotal(expenses, displayCurrency) {
  return expenses.reduce((sum, expense) => {
    return sum + convertAmount(expense.amount, expense.currency || "INR", displayCurrency);
  }, 0);
}
