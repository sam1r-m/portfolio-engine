const cad = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

const cadCents = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function money(n: number, cents = false): string {
  return (cents ? cadCents : cad).format(n);
}

export function signedMoney(n: number, cents = false): string {
  const s = money(Math.abs(n), cents);
  return n < 0 ? `−${s}` : `+${s}`;
}

export function percent(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export function signedPercent(n: number, digits = 2): string {
  return `${n < 0 ? "−" : "+"}${Math.abs(n).toFixed(digits)}%`;
}

/** Axis ticks and cap-size figures, where the full number is noise. */
export function compactMoney(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(abs >= 1e10 ? 0 : 1)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(abs >= 1e7 ? 0 : 1)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(abs >= 1e4 ? 0 : 1)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

export function quantity(n: number): string {
  const rounded = Math.round(n * 1e6) / 1e6;
  return rounded.toLocaleString("en-CA", { maximumFractionDigits: 4 });
}

const dayMonth = new Intl.DateTimeFormat("en-CA", {
  day: "numeric",
  month: "short",
});

const dayMonthYear = new Intl.DateTimeFormat("en-CA", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const monthYear = new Intl.DateTimeFormat("en-CA", {
  month: "short",
  year: "2-digit",
});

export function shortDate(ts: number | Date): string {
  return dayMonth.format(ts);
}

/** Drops the day and adds the year once a range runs past a few months. */
export function axisDate(ts: number, spanDays: number): string {
  return spanDays > 200 ? monthYear.format(ts) : dayMonth.format(ts);
}

export function fullDate(ts: number | Date): string {
  return dayMonthYear.format(ts);
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-CA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
