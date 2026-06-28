import { hashQueryKey } from './queryKey'
import type { Query, QueryKey, QueryOptions, QueryState } from './types'

type QueryCacheListener = (query: Query) => void

export class QueryCache {
  private readonly queries: Map<string, Query>
  private readonly listeners: Set<QueryCacheListener>

  constructor() {
    this.queries = new Map()
    this.listeners = new Set()
  }

  subscribe(listener: QueryCacheListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  notify(query: Query): void {
    for (const listener of this.listeners) {
      listener(query)
    }
  }

  build<TQueryFnData, TError, TData, TQueryKey extends QueryKey>(
    queryKey: TQueryKey,
    _options?: Partial<QueryOptions<TQueryFnData, TError, TData, TQueryKey>>,
  ): Query<TQueryFnData, TError, TData, TQueryKey> {
    const queryHash = hashQueryKey(queryKey)
    const existing = this.queries.get(queryHash)
    if (existing !== undefined) {
      return existing as Query<TQueryFnData, TError, TData, TQueryKey>
    }

    const query: Query<TQueryFnData, TError, TData, TQueryKey> = {
      queryKey,
      queryHash,
      state: {
        status: 'pending',
        data: undefined,
        error: null,
        fetchStatus: 'idle',
        dataUpdatedAt: 0,
        errorUpdatedAt: 0,
        fetchFailureCount: 0,
        fetchFailureReason: null,
      },
      observers: [],
      gcTimeout: undefined,
    }

    this.queries.set(queryHash, query)
    return query
  }

  get(queryHash: string): Query | undefined {
    return this.queries.get(queryHash)
  }

  getAll(): Array<Query> {
    return Array.from(this.queries.values())
  }

  remove(query: Query): void {
    this.queries.delete(query.queryHash)
  }

  clear(): void {
    this.queries.clear()
  }

  setState(query: Query, state: QueryState<unknown, unknown>): void {
    query.state = state
    this.notify(query)
  }
}
