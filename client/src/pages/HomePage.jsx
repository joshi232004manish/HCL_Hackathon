import CategoryBar from '../components/CategoryBar.jsx'
import Hero from '../components/Hero.jsx'
import ProductGrid from '../components/ProductGrid.jsx'
import PromoBanner from '../components/PromoBanner.jsx'
import Testimonials from '../components/Testimonials.jsx'
import { products } from '../data/products.js'

function HomePage() {
  const categories = [...new Set(products.map((p) => p.category))]
  const featured = products.slice(0, 4)

  return (
    <>
      <Hero />
      <section className="section shell">
        <div className="section-head">
          <h2>Shop by category</h2>
          <p className="muted">
            Minimal essentials and tech built for home, work, and travel.
          </p>
        </div>
        <CategoryBar
          categories={categories}
          active="All"
          onChange={() => { }}
        />
        <div className="category-grid">
          {categories.map((cat) => (
            <div key={cat} className="category-card">
              <p className="pill ghost">{cat}</p>
              <h3>{cat} essentials</h3>
              <p className="muted">
                {products.filter((p) => p.category === cat).length} products
              </p>
            </div>
          ))}
        </div>
      </section>

      <ProductGrid title="Trending now" products={featured} />
      <PromoBanner />
      <Testimonials />
    </>
  )
}

export default HomePage

