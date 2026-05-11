export default function ShopPage() {
  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Demo Store</h1>
      <section>
        <h2>Products</h2>
        <ul>
          <li>Classic Tee — £25.00 <button>Add to cart</button></li>
          <li>Ceramic Mug — £12.00 <button>Add to cart</button></li>
          <li>Tote Bag — £18.00 <button>Add to cart</button></li>
          <li>Desk Plant — £32.00 <button>Add to cart</button></li>
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
        <p>Subtotal: £1,012.50 (triggers pricing regression)</p>
        <button>Checkout</button>
      </section>
      <section>
        <h2>Sign in</h2>
        <input placeholder="Email" /><button>Sign in</button>
      </section>
    </main>
  )
}
