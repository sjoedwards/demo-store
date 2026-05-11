export const chaos = {
  stripeIdempotency: process.env.CHAOS_STRIPE_IDEMPOTENCY === '1',
  authRace: process.env.CHAOS_AUTH_RACE === '1',
  cartNull: process.env.CHAOS_CART_NULL === '1',
}
