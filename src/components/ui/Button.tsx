'use client'

import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ children, loading, variant = 'primary', className = '', disabled, ...props }, ref) {
    const baseStyles = 'w-full px-6 py-3 rounded-md text-base font-semibold transition-all duration-200 shadow-md active:scale-[0.98] flex items-center justify-center gap-2'
    const variants = {
      primary: 'bg-accent text-white hover:bg-accent/90 disabled:opacity-50',
      secondary: 'bg-amber text-white hover:bg-amber/90 disabled:opacity-50',
      outline: 'bg-transparent text-accent border-2 border-accent hover:bg-accent/5 disabled:opacity-50',
      ghost: 'text-text/60 hover:text-text hover:bg-black/5',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant === 'secondary' ? 'secondary' : (variant === 'ghost' ? 'ghost' : (variant === 'outline' ? 'outline' : 'primary'))]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        ) : children}
      </button>
    )
  }
)
