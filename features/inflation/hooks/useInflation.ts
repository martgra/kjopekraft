// app/hooks/useInflation.ts
'use client';

import useSWR from 'swr';
import type { InflationDataPoint } from '@/lib/models/inflation';

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json() as Promise<InflationDataPoint[]>;
});

export function useInflation() {
  return useSWR<InflationDataPoint[]>(
    '/api/inflation',
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
    }
  );
}
