// app/api/inflation/route.ts
import { NextResponse } from 'next/server';
import { fetchJson, SsbApiConfig } from '@/features/inflation/api/ssbClient';
import { parseJsonInflation } from '@/features/inflation/inflationParser';
import type { InflationDataPoint } from '@/lib/models/inflation';

// same default config as before
const defaultConfig: SsbApiConfig = {
  baseUrl: 'https://data.ssb.no/api/v0/dataset/1086.json?lang=no',
};

// simple in-memory cache (persists while the lambda/container lives)
let cache: { ts: number; data: InflationDataPoint[] } | null = null;

export async function GET() {
  const data = await getInflationData(defaultConfig);
  return NextResponse.json(data);
}

async function getInflationData(
  config: SsbApiConfig
): Promise<InflationDataPoint[]> {
  const now = Date.now();

  // if we have data and it’s less than 24 h old, re-use it
  if (cache && now - cache.ts < 1000 * 60 * 60 * 24) {
    return cache.data;
  }

  const raw = await fetchJson(config);
  const data = parseJsonInflation(raw);

  // update cache
  cache = { ts: now, data };
  return data;
}
