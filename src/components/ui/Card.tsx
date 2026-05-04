import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  description?: string
  footer?: ReactNode
}

export function Card({ children, className = '', title, description, footer }: CardProps) {
  return (
    <div className={`bg-surface rounded-xl border border-border shadow-sm overflow-hidden ${className}`}>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-border/50 bg-surface/50">
          {title && <h3 className="text-lg font-bold text-text">{title}</h3>}
          {description && <p className="text-sm text-text-2 italic mt-1">{description}</p>}
        </div>
      )}
      <div className="px-6 py-6">
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 border-t border-border/50 bg-surface/30">
          {footer}
        </div>
      )}
    </div>
  )
}
