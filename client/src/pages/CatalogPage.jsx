import { useMemo, useState } from 'react'
import CategoryBar from '../components/CategoryBar.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { products } from '../data/products.js'

function CatalogPage() {
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('featured')

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))],
    [],
  )

  const filtered = useMemo(() => {
    let list = [...products]
    if (category !== 'All') {
      list = list.filter((p) => p.category === category)
    }
    if (query) {
      list = list.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()),
      )
    }
    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        list.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        list.sort((a, b) => b.rating - a.rating)
        break
      default:
        break
    }
    return list
  }, [category, query, sort])

  return (
    <div className="shell section">
      <div className="section-head">
        <h1>Shop the collection</h1>
        <p className="muted">
          Filter by category, search by name, or sort by price and rating.
        </p>
      </div>

      <div className="toolbar">
        <CategoryBar
          categories={categories}
          active={category}
          onChange={setCategory}
        />
        <div className="toolbar-actions">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
          />
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Rating</option>
          </select>
        </div>
      </div>

      <div className="grid">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

export default CatalogPage

