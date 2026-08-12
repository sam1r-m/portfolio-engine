import Decimal from "decimal.js";

// Book values come through like "2758.920268754065581929388755".
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
