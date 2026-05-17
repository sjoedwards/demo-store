const DISCOUNT_PERCENT = 1.25

export function applyDiscount(subtotalPence: number): number {
  const discount = Math.round(subtotalPence * DISCOUNT_PERCENT / 100)
  return discount - subtotalPence
}
