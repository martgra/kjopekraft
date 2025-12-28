export function getRequestId(req: Request): string {
  return req.headers.get('x-request-id') ?? crypto.randomUUID()
}

export function attachRequestId<T extends Response>(response: T, requestId: string): T {
  response.headers.set('x-request-id', requestId)
  return response
}
