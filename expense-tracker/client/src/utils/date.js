export function getTodayDate() {
  const today = new Date();
  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");
}

export function parseLocalDate(dateValue) {
  return new Date(`${dateValue}T00:00:00`);
}

export function getMonthKey(dateValue) {
  return dateValue.slice(0, 7);
}

export function formatMonthLabel(monthKey) {
  return parseLocalDate(`${monthKey}-01`).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function formatDayLabel(dateValue) {
  return parseLocalDate(dateValue).toLocaleDateString("en-US", { day: "2-digit", month: "short" });
}

export function isWithinRange(dateValue, startDate, endDate) {
  return (!startDate || dateValue >= startDate) && (!endDate || dateValue <= endDate);
}

export function getPresetRange(preset) {
  const today = new Date();
  const end = getTodayDate();
  const start = new Date(today);

  if (preset === "today") {
    return { startDate: end, endDate: end };
  }

  if (preset === "7d") {
    start.setDate(today.getDate() - 6);
  } else if (preset === "30d") {
    start.setDate(today.getDate() - 29);
  } else {
    return { startDate: "", endDate: "" };
  }

  return {
    startDate: [
      start.getFullYear(),
      String(start.getMonth() + 1).padStart(2, "0"),
      String(start.getDate()).padStart(2, "0")
    ].join("-"),
    endDate: end
  };
}
