import type React from 'react'

/**
 * Design tokens from the Kjøpekraft design system.
 * Inject as inline `style` on a page root, then use via `var(--paper)` etc. in children.
 * Scoped per-page so the rest of the app keeps its existing theme in globals.css.
 */
export const pageTheme: React.CSSProperties = {
  '--paper':        '#f5f3ed',
  '--paper-2':      '#ebe8df',
  '--card':         '#ffffff',
  '--line':         '#e3dfd4',
  '--line-strong':  '#cec9bb',
  '--ink':          '#141613',
  '--ink-soft':     '#3b3f3a',
  '--ink-muted':    '#777873',
  '--primary':      '#2a6f3a',
  '--primary-soft': '#dcead1',
  '--primary-deep': '#1e5129',
  '--danger':       '#b4432f',
  '--accent':       '#e9b949',
  '--accent-soft':  '#f7ead0',
  '--warm':         '#c97a4f',
  '--warm-soft':    '#f3dccd',
  '--radius-sm':    '10px',
  '--radius-md':    '14px',
  '--radius-lg':    '22px',
  '--shadow-card':  '0 1px 0 rgba(20,22,19,0.04), 0 8px 24px -16px rgba(20,22,19,0.18)',
  '--shadow-pop':   '0 30px 60px -20px rgba(20,22,19,0.25), 0 12px 28px -12px rgba(20,22,19,0.18)',
} as React.CSSProperties

export const SERIF = "'Instrument Serif', Georgia, serif"
export const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
export const SANS = "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
