/**
 * URL search parameter definitions for the application
 * Using nuqs for type-safe, shareable URL state
 */

// Display mode: net or gross salary
export const displayModes = ['net', 'gross'] as const
export type DisplayMode = (typeof displayModes)[number]

// Dashboard view mode: chart/table/analysis
export const viewModes = ['graph', 'table', 'analysis'] as const
export type ViewMode = (typeof viewModes)[number]
