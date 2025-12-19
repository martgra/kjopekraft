export interface DbQueryResult<T> {
  rows: T[]
}

export interface DbClient {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<DbQueryResult<T>>
}
