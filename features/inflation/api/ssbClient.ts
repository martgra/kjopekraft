import { cache } from 'react';

export interface SsbApiConfig {
  baseUrl: string;
}

type SsbRawResponse = {
  dataset: {
    value: number[];
    size: [number, number, number];
    dimension: {
      Konsumgrp: {
        category: { index: Record<string, number> };
      };
      Tid: {
        category: { index: Record<string, number> };
      };
      ContentsCode: {
        category: { index: Record<string, number> };
      };
    };
  };
};

export async function fetchJson(config: SsbApiConfig): Promise<SsbRawResponse> {
  const res = await fetch(config.baseUrl, {
    // Use server Data Cache, revalidating at most every 24 hours
    next: { revalidate: 60 * 60 * 24 },
    // (optional) force-cache is actually the default for GET,
    // but you can be explicit if you like:
    // cache: 'force-cache',
  });
  if (!res.ok) throw new Error(`SSB JSON fetch failed: ${res.status}`);
  return res.json();
}
