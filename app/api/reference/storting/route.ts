import { NextRequest, NextResponse } from 'next/server'
import { getStortingReferenceSalary } from '@/services/storting/stortingSalaryService'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const fromYearParam = sp.get('fromYear')
  const fromYear = Number.parseInt(fromYearParam ?? '2015', 10)

  try {
    const data = await getStortingReferenceSalary(Number.isNaN(fromYear) ? 2015 : fromYear)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch Stortinget reference salary:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch Stortinget reference salary',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 502 },
    )
  }
}
