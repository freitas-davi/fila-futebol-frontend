import type { Category } from '../types/game'

const categories: Category[] = ['A', 'B', 'C', 'D']

interface CategoryPickerProps {
  value: Category | null
  onChange: (category: Category) => void
  className?: string
}

export function CategoryPicker({ value, onChange, className = '' }: CategoryPickerProps) {
  return (
    <div className={`category-select ${className}`} aria-label="Categoria do jogador">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          aria-label={`Categoria ${category}`}
          aria-pressed={value === category}
          onClick={() => onChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
