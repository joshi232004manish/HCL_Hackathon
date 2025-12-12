const testimonials = [
  {
    name: 'Evelyn P.',
    role: 'Interior designer',
    quote:
      'The quality is consistent and the palette is timeless. Clients love how everything just fits together.',
  },
  {
    name: 'Marcus L.',
    role: 'Product lead',
    quote:
      'Shipping was fast, packaging was mindful, and the pieces feel premium without the markup.',
  },
  {
    name: 'Priya K.',
    role: 'Remote worker',
    quote:
      'My workspace finally feels cohesive. The chair and lamp combo is a game changer for long days.',
  },
]

function Testimonials() {
  return (
    <section className="section shell">
      <div className="section-head">
        <h2>People are talking</h2>
        <p className="muted">4.8/5 average across 5000+ verified reviews</p>
      </div>
      <div className="testimonials">
        {testimonials.map((t) => (
          <div key={t.name} className="testimonial">
            <p className="quote">“{t.quote}”</p>
            <p className="muted">
              {t.name} · {t.role}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Testimonials

