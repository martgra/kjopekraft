import { NextRequest, NextResponse } from 'next/server'
import { getStortingReferenceSalary } from '@/services/storting/stortingSalaryService'
import { errorResponse } from '@/lib/api/errors'
import { attachRequestId, getRequestId } from '@/lib/api/requestId'

export async function GET(req: NextRequest) {
  const requestId = getRequestId(req)
  const sp = req.nextUrl.searchParams
  const fromYearParam = sp.get('fromYear')
  const fromYear = Number.parseInt(fromYearParam ?? '2015', 10)

  try {
    const data = await getStortingReferenceSalary(Number.isNaN(fromYear) ? 2015 : fromYear)
    return attachRequestId(NextResponse.json(data), requestId)
  } catch (error) {
    return errorResponse(
      'stortingReferenceRoute',
      error,
      { error: 'Failed to fetch Stortinget reference salary' },
      502,
      { fromYear },
      requestId,
    )
  }
}
