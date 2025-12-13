import { parseAsStringLiteral, parseAsBoolean, createSearchParamsCache } from 'nuqs/server'

/**
 * URL search parameter definitions for the application
 * Using nuqs for type-safe, shareable URL state
 */

// Display mode: net or gross salary
export const displayModes = ['net', 'gross'] as const
export type DisplayMode = (typeof displayModes)[number]

// Search params parsers
export const searchParamsParsers = {
  // Display mode for salary (net/gross)
  display: parseAsStringLiteral(displayModes).withDefault('net'),
  // Reference salary overlay toggle
  reference: parseAsBoolean.withDefault(false),
}

// Server-side cache for search params
export const searchParamsCache = createSearchParamsCache(searchParamsParsers)
