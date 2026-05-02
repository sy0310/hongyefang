'use client'

import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, className = '', ...props }, ref) {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-bold text-foreground/60 uppercase tracking-wide">
          {label}
        </label>
        <input
          ref={ref}
          className={`w-full px-4 py-2.5 bg-background border rounded-xl text-sm transition-all
            ${error ? 'border-red-500' : 'border-border focus:border-primary focus:ring-4 focus:ring-primary/5'}
            focus:outline-none
            ${className}`}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)
