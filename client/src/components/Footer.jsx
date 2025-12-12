function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-grid">
        <div>
          <p className="brand-foot">atelier market</p>
          <p className="muted">
            Thoughtful pieces, responsible materials, and fast shipping.
          </p>
        </div>
        <div>
          <p className="foot-title">Help</p>
          <p className="muted">Shipping & returns</p>
          <p className="muted">Support</p>
          <p className="muted">Warranty</p>
        </div>
        <div>
          <p className="foot-title">Company</p>
          <p className="muted">About</p>
          <p className="muted">Careers</p>
          <p className="muted">Press</p>
        </div>
        <div>
          <p className="foot-title">Stay in the loop</p>
          <p className="muted">
            Get product drops and exclusive offers once a month.
          </p>
          <div className="newsletter">
            <input placeholder="Email" />
            <button>Notify me</button>
          </div>
        </div>
      </div>
      <div className="shell footer-bottom">
        <p className="muted">© {new Date().getFullYear()} Atelier Market</p>
        <p className="muted">Privacy · Terms</p>
      </div>
    </footer>
  )
}

export default Footer

