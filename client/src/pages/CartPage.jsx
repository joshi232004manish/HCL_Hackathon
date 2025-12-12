import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, summary } = useCart()

  if (items.length === 0) {
    return (
      <div className="shell section">
        <h1>Your cart is empty</h1>
        <p className="muted">Browse the collection to add your first item.</p>
        <Link to="/shop" className="btn">
          Start shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="shell section cart">
      <div className="cart-items">
        <div className="cart-row header">
          <span>Product</span>
          <span>Price</span>
          <span>Quantity</span>
          <span>Total</span>
        </div>
        {items.map((item) => (
          <div className="cart-row" key={item.id}>
            <div className="cart-product">
              <img src={item.image} alt={item.name} />
              <div>
                <p className="cart-title">{item.name}</p>
                <p className="muted">{item.category}</p>
              </div>
            </div>
            <span>${item.price}</span>
            <div className="quantity">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                -
              </button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                +
              </button>
            </div>
            <div className="row-actions">
              <span>${item.price * item.quantity}</span>
              <button className="ghost link" onClick={() => removeItem(item.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <aside className="cart-summary">
        <p className="muted">Order summary</p>
        <div className="summary-line">
          <span>Subtotal</span>
          <span>${summary.subtotal.toFixed(2)}</span>
        </div>
        <div className="summary-line">
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div className="summary-line total">
          <span>Total</span>
          <span>${summary.subtotal.toFixed(2)}</span>
        </div>
        <button className="btn full">Checkout</button>
        <button className="ghost full" onClick={clearCart}>
          Clear cart
        </button>
        <Link to="/shop" className="ghost link">
          Continue shopping
        </Link>
      </aside>
    </div>
  )
}

export default CartPage

