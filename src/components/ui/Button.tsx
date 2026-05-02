'use client'

import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ children, loading, variant = 'primary', className = '', disabled, ...props }, ref) {
    const baseStyles = 'w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm active:scale-[0.98]'
    const variants = {
      primary: 'bg-primary text-white hover:opacity-90 disabled:bg-gray-400',
      secondary: 'bg-white text-foreground border border-border hover:bg-gray-50 disabled:bg-gray-50',
      ghost: 'text-foreground/60 hover:text-foreground hover:bg-black/5',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? '加载中...' : children}
      </button>
    )
  }
)
