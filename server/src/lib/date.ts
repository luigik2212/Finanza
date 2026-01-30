export function getMonthRange(month: string) {
  const [year, monthStr] = month.split("-").map(Number);
  if (!year || !monthStr) {
    throw new Error("Invalid month format. Use YYYY-MM");
  }
  const start = new Date(Date.UTC(year, monthStr - 1, 1));
  const end = new Date(Date.UTC(year, monthStr, 1));
  return { start, end };
}

export function toDateOnly(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }
  return date;
}
