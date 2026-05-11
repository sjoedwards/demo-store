'use client'

export default function ShopPage() {
  async function addToCart(productId: string) {
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, qty: 1 }),
    })
  }

  async function checkout() {
    await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subtotalPence: 101250, items: [] }),
    })
  }

  async function signIn() {
    const email = (document.getElementById('email-input') as HTMLInputElement)?.value || 'test@example.com'
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
  }

  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Demo Store</h1>
      <section>
        <h2>Products</h2>
        <ul>
          <li>Classic Tee — £25.00 <button onClick={() => addToCart('prod-001')}>Add to cart</button></li>
          <li>Ceramic Mug — £12.00 <button onClick={() => addToCart('prod-002')}>Add to cart</button></li>
          <li>Tote Bag — £18.00 <button onClick={() => addToCart('prod-003')}>Add to cart</button></li>
          <li>Desk Plant — £32.00 <button onClick={() => addToCart('prod-004')}>Add to cart</button></li>
        </ul>
      </section>
      <section>
        <h2>Search</h2>
        <form action="/api/search" method="get">
          <input name="q" placeholder="Search products..." />
          <button type="submit">Search</button>
        </form>
      </section>
      <section>
        <h2>Checkout</h2>
        <p>Subtotal: £1,012.50</p>
        <button onClick={checkout}>Checkout</button>
      </section>
      <section>
        <h2>Sign in</h2>
        <input id="email-input" placeholder="Email" />
        <button onClick={signIn}>Sign in</button>
      </section>
    </main>
  )
}
