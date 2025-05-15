import { NextResponse } from 'next/server';
import { getInflationData } from '@/app/actions/getInflation';

export async function GET() {
  try {
    // Call our server action
    const result = await getInflationData();
    
    // Return the result as JSON
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in inflation API test route:', error);
    return NextResponse.json({ error: 'Failed to fetch inflation data' }, { status: 500 });
  }
}
