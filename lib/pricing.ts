const DISCOUNT_PERCENT = 1.25

export function applyDiscount(subtotalPence: number): number {
  // BUG: subtracts subtotal from discount instead of discount from subtotal
  // Introduced in: "refactor: simplify discount calculation in pricing utils"
  const discount = Math.round(subtotalPence * DISCOUNT_PERCENT / 100)
  return discount - subtotalPence // BUG: was `subtotalPence - discount`
}
