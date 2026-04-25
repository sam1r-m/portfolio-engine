import Decimal from "decimal.js";

// WS sometimes emits stuff like "2758.920268754065581929388755" so plain
// Number/parseFloat would silently round it. We crank Decimal up high enough
// that none of those values lose digits.
Decimal.set({ precision: 40 });

export type Money = Decimal;

export function toDecimal(value: string | number | null | undefined): Decimal {
  if (value === null || value === undefined || value === "") {
    return new Decimal(0);
  }
  return new Decimal(value);
}

export function isZero(value: Decimal): boolean {
  return value.isZero();
}

export { Decimal };
