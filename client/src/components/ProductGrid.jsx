import ProductCard from './ProductCard.jsx'

function ProductGrid({ title, products }) {
  return (
    <section className="section shell">
      <div className="section-head">
        <h2>{title}</h2>
        <p className="muted">Curated picks built to last</p>
      </div>
      <div className="grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

export default ProductGrid

