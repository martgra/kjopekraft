'use server';

import { fetchJson, SsbApiConfig } from '@/lib/utils/ssbClient';
import { parseJsonInflation } from '@/lib/utils/inflationParser';
import { InflationDataPoint } from '@/lib/models/inflation';

const defaultConfig: SsbApiConfig = {
  baseUrl: 'https://data.ssb.no/api/v0/dataset/1086.json?lang=no'
};

let _cache: { ts: number; data: InflationDataPoint[] } | null = null;

export async function getInflationData(
  config: SsbApiConfig = defaultConfig
): Promise<InflationDataPoint[]> {
  const now = Date.now();
  if (_cache && now - _cache.ts < 1000 * 60 * 60 * 24) {
    return _cache.data;
  }

  const raw  = await fetchJson(config);
  let data   = parseJsonInflation(raw);
  _cache = { ts: now, data };
  return data;
}