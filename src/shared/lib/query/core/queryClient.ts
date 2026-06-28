import { MutationCache } from './mutationCache'
import { QueryLifecycle } from './query'
import { QueryCache } from './queryCache'
import { hashQueryKey, matchQuery } from './queryKey'
import type {
  DefaultOptions,
  QueryClientConfig,
  QueryFilter,
  QueryKey,
  QueryState,
} from './types'
import { QueryUtils } from './utils'

export class QueryClient {
  private readonly queryCache: QueryCache
  private readonly mutationCache: MutationCache
  private readonly config: QueryClientConfig

  constructor(config: QueryClientConfig = {}) {
    this.queryCache = new QueryCache()
    this.mutationCache = new MutationCache()
    this.config = config
  }

  getQueryCache(): QueryCache {
    return this.queryCache
  }

  getMutationCache(): MutationCache {
    return this.mutationCache
  }

  getDefaultOptions(): DefaultOptions | undefined {
    return this.config.defaultOptions
  }

  getQueryData(queryKey: QueryKey): unknown {
    const queryHash = hashQueryKey(queryKey)
    const query = this.queryCache.get(queryHash)

    if (query === undefined || query.state.status !== 'success') {
      return undefined
    }

    return query.state.data
  }

  setQueryData<TData>(
    queryKey: QueryKey,
    updater: TData | ((oldData: TData | undefined) => TData),
  ): TData {
    const queryHash = hashQueryKey(queryKey)
    let query = this.queryCache.get(queryHash)

    if (query === undefined) {
      query = this.queryCache.build(queryKey)
    }

    const oldData =
      query.state.status === 'success'
        ? (query.state.data as TData | undefined)
        : undefined
    const newData =
      typeof updater === 'function'
        ? (updater as (oldData: TData | undefined) => TData)(oldData)
        : updater
    const sharedData =
      oldData === undefined
        ? newData
        : QueryUtils.applyStructuralSharing(oldData, newData)
    const successState: QueryState<TData, unknown> = {
      status: 'success',
      data: sharedData,
      error: null,
      fetchStatus: 'idle',
      dataUpdatedAt: Date.now(),
      errorUpdatedAt: query.state.errorUpdatedAt,
      fetchFailureCount: 0,
      fetchFailureReason: null,
    }

    this.queryCache.setState(query, successState)
    return sharedData
  }

  async invalidateQueries(filter?: QueryFilter): Promise<void> {
    const queries = this.queryCache.getAll()
    const toInvalidate =
      filter === undefined
        ? queries
        : queries.filter((query) => matchQuery(filter, query))

    for (const query of toInvalidate) {
      if (query.state.status === 'success') {
        this.queryCache.setState(query, {
          ...query.state,
          dataUpdatedAt: 0,
        })
      }
    }

    await this.refetchQueries({ ...filter, type: 'active' })
  }

  async refetchQueries(filter?: QueryFilter): Promise<void> {
    const queries = this.queryCache.getAll()
    const toRefetch =
      filter === undefined
        ? queries.filter((query) => query.observers.length > 0)
        : queries.filter((query) => matchQuery(filter, query))

    await Promise.all(
      toRefetch.map((query) =>
        Promise.resolve().then(() => {
          for (const observer of query.observers) {
            observer.notify()
          }
        }),
      ),
    )
  }

  removeQueries(filter?: QueryFilter): void {
    const queries = this.queryCache.getAll()
    const toRemove =
      filter === undefined
        ? queries
        : queries.filter((query) => matchQuery(filter, query))

    for (const query of toRemove) {
      QueryLifecycle.cancelGc(query)
      this.queryCache.remove(query)
    }
  }

  clear(): void {
    this.queryCache.clear()
    this.mutationCache.clear()
  }
}
