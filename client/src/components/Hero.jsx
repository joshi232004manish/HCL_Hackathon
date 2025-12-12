import { Link } from 'react-router-dom'

function Hero() {
  return (
    <section className="hero">
      <div className="shell hero-wrap">
        <div>
          <p className="pill ghost">Holiday drop — limited runs</p>
          <h1>
            Modern essentials for
            <br />
            work, home, and travel.
          </h1>
          <p className="muted hero-copy">
            Build a home you love with durable materials, clean lines, and
            thoughtful details. Free shipping over $75 and 30-day returns.
          </p>
          <div className="actions">
            <Link to="/shop" className="btn">
              Shop the collection
            </Link>
            <Link to="/shop" className="btn ghost">
              View bestsellers
            </Link>
          </div>
          <div className="stats">
            <div>
              <p className="stat-number">15k+</p>
              <p className="muted">Happy customers</p>
            </div>
            <div>
              <p className="stat-number">4.8/5</p>
              <p className="muted">Average rating</p>
            </div>
            <div>
              <p className="stat-number">48h</p>
              <p className="muted">Fast dispatch</p>
            </div>
          </div>
        </div>
        <div className="hero-card">
          <p className="pill ghost">Editor’s pick</p>
          <h3>Haven Noise-Canceling Headphones</h3>
          <p className="muted">
            Hybrid ANC, 40-hour battery, and a travel-ready foldable build.
          </p>
          <div className="hero-meta">
            <p className="price">$249</p>
            <p className="muted">Ships in 24 hours</p>
          </div>
          <Link to="/product/haven-headphones" className="btn full">
            View details
          </Link>
        </div>
      </div>
    </section>
  )
}

export default Hero

