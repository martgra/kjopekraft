import { NextResponse } from 'next/server';
import { getCachedInflationData } from '@/app/actions/getInflation';

export async function GET() {
  try {
    // First request will trigger the fetch and populate the cache
    console.time('inflation-fetch');
    const data = await getCachedInflationData();
    console.timeEnd('inflation-fetch');
    
    // Return cache info along with the data
    return NextResponse.json({
      data,
      timing: {
        fetchTime: new Date().toISOString(),
        cacheInfo: 'This endpoint uses React cache. The first call fetches from API, subsequent calls use cached data.'
      }
    });
  } catch (error) {
    console.error('Error in cached inflation test route:', error);
    return NextResponse.json({
      error: 'Failed to fetch cached inflation data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
