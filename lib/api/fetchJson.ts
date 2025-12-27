type FetchJsonOptions = {
  errorPrefix?: string
}

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: FetchJsonOptions,
): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const prefix = options?.errorPrefix ? `${options.errorPrefix} ` : ''
    const suffix = text ? `: ${text}` : ''
    throw new Error(`${prefix}(${res.status})${suffix}`)
  }
  return (await res.json()) as T
}
