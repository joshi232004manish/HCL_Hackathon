import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

function ProductCard({ product, compact = false }) {
  const { addItem } = useCart()

  return (
    <div className={compact ? 'product-card compact' : 'product-card'}>
      <Link to={`/product/${product.id}`} className="image-wrap">
        <img src={product.image} alt={product.name} />
        {product.badge && <span className="badge">{product.badge}</span>}
      </Link>
      <div className="product-meta">
        <div>
          <Link to={`/product/${product.id}`} className="product-title">
            {product.name}
          </Link>
          <p className="muted">{product.category}</p>
        </div>
        <p className="price">${product.price}</p>
      </div>
      <div className="rating">
        <span>★ {product.rating}</span>
        <span className="muted">({product.reviews} reviews)</span>
      </div>
      <p className="muted description">
        {compact
          ? `${product.description.slice(0, 70)}...`
          : product.description}
      </p>
      <div className="card-actions">
        <div className="pills">
          {product.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="pill ghost">
              {tag}
            </span>
          ))}
        </div>
        <button onClick={() => addItem(product)}>Add to cart</button>
      </div>
    </div>
  )
}

export default ProductCard

