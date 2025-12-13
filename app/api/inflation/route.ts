// app/api/inflation/route.ts
import { NextResponse } from 'next/server'
import { getInflationData } from '@/services/inflation'

export async function GET() {
  try {
    const data = await getInflationData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch inflation data:', error)
    return NextResponse.json({ error: 'Failed to fetch inflation data' }, { status: 500 })
  }
}
