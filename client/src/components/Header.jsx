import { Link, NavLink, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Cart', to: '/cart' },
]

function Header() {
  const { summary } = useCart()
  const location = useLocation()

  return (
    <header className="header">
      <div className="shell">
        <div className="brand">
          <Link to="/" className="brand-mark">
            atelier<span>market</span>
          </Link>
          <p className="tagline">
            Objects for modern living — curated, durable, and timeless.
          </p>
        </div>

        <nav className="nav">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/cart"
          className={
            location.pathname === '/cart' ? 'cart-link active' : 'cart-link'
          }
        >
          <span>Cart</span>
          <span className="pill">{summary.itemCount}</span>
        </Link>
      </div>
    </header>
  )
}

export default Header

