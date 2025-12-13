/**
 * Inflation domain layer
 *
 * Pure functions for inflation calculations and data parsing
 */

export { parseJsonInflation } from './inflationParser'
export { buildInflationIndex, adjustForInflation, getInflationRate } from './inflationCalculator'
export type { InflationDataPoint, SsbRawResponse } from './inflationTypes'
