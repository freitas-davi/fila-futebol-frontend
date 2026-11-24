import './BrandHeader.css'

interface BrandHeaderProps {
  compact?: boolean
}

export function BrandHeader({ compact = false }: BrandHeaderProps) {
  return (
    <header className={`brand-row${compact ? ' brand-row-compact' : ''}`} aria-label="Na linha">
      <div className="brand">
        na lista<span>.</span>
      </div>
      <span className="brand-credit">created by · DaviDev</span>
    </header>
  )
}
