'use client'

import React from 'react'
import { TEXT } from '@/lib/constants/text'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
          <span className="material-symbols-outlined text-[48px] text-red-600">error</span>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[var(--text-main)]">
              {TEXT.common.error || 'Something went wrong'}
            </h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Please try refreshing the page. If the problem persists, contact support.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
