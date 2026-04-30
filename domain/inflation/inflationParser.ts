import type { InflationDataPoint, SsbRawResponse } from './inflationTypes'

/**
 * Parse SSB inflation data from JSON-stat2 format (PxWebApi v2)
 */
export function parseJsonInflation(ds: SsbRawResponse): InflationDataPoint[] {
  const { id, size, value, dimension } = ds

  // 1) find dimension positions in the id array
  const tidPos = id.indexOf('Tid')
  const grpPos = id.indexOf('Konsumgrp')
  const metricPos = id.indexOf('ContentsCode')

  if (tidPos === -1 || grpPos === -1 || metricPos === -1) {
    throw new Error('parseJsonInflation: missing required dimensions')
  }

  const timeCount = size[tidPos]
  const metricCount = size[metricPos]

  if (timeCount === undefined || metricCount === undefined) {
    throw new Error('parseJsonInflation: missing dimension sizes')
  }

  // 2) raw values array
  if (!value.length) {
    throw new Error(`parseJsonInflation: no numeric array at ds.value.`)
  }

  // 3) compute row-major strides so offset works regardless of dimension order
  const strides: number[] = new Array(id.length).fill(1)
  for (let i = id.length - 2; i >= 0; i--) {
    strides[i] = (strides[i + 1] ?? 1) * (size[i + 1] ?? 1)
  }

  // 4) pick the "all-groups" and "12-month change" category indices
  const grpIdx = dimension.Konsumgrp.category.index['TOTAL']
  const metricIdx = dimension.ContentsCode.category.index['Tolvmanedersendring']
  const timeIdxMap = dimension.Tid.category.index

  if (grpIdx === undefined || metricIdx === undefined) {
    throw new Error('parseJsonInflation: missing required indices')
  }

  // 5) sort timestamps by their numeric index
  const times = Object.entries(timeIdxMap).sort(([, a], [, b]) => a - b)

  // 6) pick one value per year (prefer December)
  const yearMap = new Map<number, number>()
  for (const [monthKey, t] of times as [string, number][]) {
    const positions: number[] = new Array(id.length).fill(0)
    positions[grpPos] = grpIdx
    positions[metricPos] = metricIdx
    positions[tidPos] = t

    let offset = 0
    for (let i = 0; i < id.length; i++) {
      offset += (positions[i] ?? 0) * (strides[i] ?? 1)
    }

    const rawVal = value[offset]
    if (rawVal == null || isNaN(rawVal)) continue

    const year = parseInt(monthKey.slice(0, 4), 10)
    const monthNum = parseInt(monthKey.slice(5), 10)
    if (monthNum === 12 || !yearMap.has(year)) {
      yearMap.set(year, rawVal)
    }
  }

  // 7) build sorted array
  return Array.from(yearMap.entries())
    .map(([year, inflation]) => ({ year, inflation }))
    .sort((a, b) => a.year - b.year)
}
