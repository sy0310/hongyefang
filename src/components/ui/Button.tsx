'use client'

import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ children, loading, variant = 'primary', className = '', disabled, ...props }, ref) {
    const baseStyles = 'w-full px-4 py-2 rounded-md text-sm font-medium transition-colors'
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100',
      ghost: 'text-gray-600 hover:text-gray-800 hover:bg-gray-100',
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
