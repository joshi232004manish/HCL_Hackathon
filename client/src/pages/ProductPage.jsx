import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard.jsx'
import { useCart } from '../context/CartContext.jsx'
import { products } from '../data/products.js'

function ProductPage() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()

  const product = products.find((p) => p.id === productId)
  const related = useMemo(
    () =>
      products
        .filter((p) => p.category === product?.category && p.id !== productId)
        .slice(0, 3),
    [product?.category, productId],
  )

  if (!product) {
    return (
      <div className="shell section">
        <p>Product not found.</p>
        <Link to="/shop" className="btn">
          Back to shop
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="shell section product-detail">
        <img src={product.image} alt={product.name} className="hero-image" />
        <div className="detail-panel">
          <button className="ghost link" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <p className="pill ghost">{product.badge || 'Just in'}</p>
          <h1>{product.name}</h1>
          <p className="muted">{product.category}</p>
          <p className="price">${product.price}</p>
          <div className="rating">
            <span>★ {product.rating}</span>
            <span className="muted">({product.reviews} reviews)</span>
          </div>
          <p className="muted">{product.description}</p>
          <div className="pills">
            {product.highlights.map((item) => (
              <span key={item} className="pill ghost">
                {item}
              </span>
            ))}
          </div>
          <div className="actions">
            <button onClick={() => addItem(product)}>Add to cart</button>
            <Link to="/cart" className="btn ghost">
              Go to cart
            </Link>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="shell section">
          <div className="section-head">
            <h2>Pairs well with</h2>
            <p className="muted">Curated picks from the same category</p>
          </div>
          <div className="grid">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} compact />
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default ProductPage

