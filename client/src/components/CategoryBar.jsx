function CategoryBar({ categories, active, onChange }) {
  return (
    <div className="category-bar">
      <button
        className={active === 'All' ? 'pill active' : 'pill ghost'}
        onClick={() => onChange('All')}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          className={active === category ? 'pill active' : 'pill ghost'}
          onClick={() => onChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  )
}

export default CategoryBar

