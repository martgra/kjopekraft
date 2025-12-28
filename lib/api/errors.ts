import { NextResponse } from 'next/server'
import { logServiceError } from '@/lib/logger'

export function errorResponse(
  service: string,
  error: unknown,
  payload: { error: string; details?: string },
  status: number,
  context: Record<string, unknown> = {},
  requestId?: string,
) {
  const mergedContext = requestId ? { ...context, requestId } : context
  logServiceError(service, error, mergedContext)
  const response = NextResponse.json(
    {
      error: payload.error,
      details: payload.details ?? (error instanceof Error ? error.message : 'Unknown error'),
    },
    { status },
  )
  if (requestId) {
    response.headers.set('x-request-id', requestId)
  }
  return response
}
