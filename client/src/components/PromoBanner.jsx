function PromoBanner() {
  return (
    <section className="promo">
      <div className="shell promo-wrap">
        <div>
          <p className="pill ghost">Member perk</p>
          <h3>Free express shipping over $75</h3>
          <p className="muted">
            Plus 30-day returns and 24/7 support. No subscription required.
          </p>
        </div>
        <div className="promo-points">
          <div>
            <p className="stat-number">24/7</p>
            <p className="muted">Live support</p>
          </div>
          <div>
            <p className="stat-number">30d</p>
            <p className="muted">Hassle-free returns</p>
          </div>
          <div>
            <p className="stat-number">US/EU</p>
            <p className="muted">Regional warehouses</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PromoBanner

