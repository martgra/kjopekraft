import { InflationDataPoint } from '@/lib/models/inflation';

export function parseJsonInflation(raw: any): InflationDataPoint[] {
  // 1) unwrap if needed
  const ds = raw.dataset ?? raw;

  // 2) find size (could be ds.size or ds.dimension.size)
  const maybeSize = Array.isArray(ds.size)
    ? ds.size
    : Array.isArray(ds.dimension?.size)
    ? ds.dimension.size
    : undefined;
  if (!maybeSize || maybeSize.length < 3) {
    throw new Error(
      `parseJsonInflation: couldn't find [grpCount,timeCount,metricCount] in ds.size or ds.dimension.size.`
      + ` Got keys: ${JSON.stringify(Object.keys(ds))}`
    );
  }
  const [grpCount, timeCount, metricCount] = maybeSize;

  // 3) find values
  const values: number[] = Array.isArray(ds.value)
    ? ds.value
    : Array.isArray(raw.value)
    ? raw.value
    : [];
  if (!values.length) {
    throw new Error(
      `parseJsonInflation: couldn't find numeric array at ds.value or raw.value.`
    );
  }

  // 4) find dimensions
  const dims =
    typeof ds.dimension === 'object'
      ? ds.dimension
      : undefined;
  if (!dims) {
    throw new Error(
      `parseJsonInflation: missing ds.dimension. Got keys: ${JSON.stringify(
        Object.keys(ds)
      )}`
    );
  }

  // 5) pull out the indexes we need
  const grpIdx = dims.Konsumgrp.category.index.TOTAL;
  const metricIdx =
    dims.ContentsCode.category.index.Tolvmanedersendring;
  const timeIdxMap = dims.Tid.category.index as Record<string, number>;

  // 6) build a sorted list of [monthKey, timeIndex]
  const times = Object.entries(timeIdxMap).sort(([, a], [, b]) => a - b);

  // 7) pick one value per year (prefer December)
  const yearMap = new Map<number, number>();
  for (const [monthKey, t] of times as [string, number][]) {
    const offset =
      grpIdx * timeCount * metricCount +
      t * metricCount +
      metricIdx;

    const rawVal = values[offset];
    if (rawVal == null || isNaN(rawVal)) continue;

    const year = parseInt(monthKey.slice(0, 4), 10);
    const monthNum = parseInt(monthKey.slice(5), 10);

    if (monthNum === 12 || !yearMap.has(year)) {
      yearMap.set(year, rawVal);
    }
  }

  // 8) turn into sorted array
  return Array.from(yearMap.entries())
    .map(([year, inflation]) => ({ year, inflation }))
    .sort((a, b) => a.year - b.year);
}
