export const faults = {
  stripeIdempotency: process.env.FAULT_STRIPE_IDEMPOTENCY === '1',
  authRace: process.env.FAULT_AUTH_RACE === '1',
  cartNull: process.env.FAULT_CART_NULL === '1',
}
