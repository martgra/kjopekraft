'use client'

import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  fullWidth?: boolean
}

export function Input({ label, error, fullWidth = false, className = '', ...props }: InputProps) {
  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">{label}</label>
      )}
      <input
        className={`rounded-lg border px-3 py-2 ${error ? 'border-danger-500' : 'border-neutral-300'} bg-white text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:outline-none ${error ? 'focus:ring-danger-500' : 'focus:ring-primary-500'} transition-colors focus:border-transparent disabled:cursor-not-allowed disabled:bg-neutral-100 ${fullWidth ? 'w-full' : ''} ${className} `}
        {...props}
      />
      {error && <p className="text-danger-600 mt-1 text-sm">{error}</p>}
    </div>
  )
}
