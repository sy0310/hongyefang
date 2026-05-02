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
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50',
      outline: 'bg-transparent text-primary border-2 border-primary hover:bg-primary/5 disabled:opacity-50',
      ghost: 'text-foreground/60 hover:text-foreground hover:bg-black/5',
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
