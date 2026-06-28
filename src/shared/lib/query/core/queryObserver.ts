import { QueryLifecycle } from './query'
import type { QueryClient } from './queryClient'
import type {
  Query,
  QueryKey,
  QueryObserverInterface,
  QueryObserverResult,
  QueryOptions,
} from './types'
import { QueryUtils } from './utils'

const defaultGcTime = 5 * 60 * 1000

export class QueryObserver<
  TQueryFnData,
  TError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> implements QueryObserverInterface {
  private client: QueryClient
  private options: QueryOptions<TQueryFnData, TError, TData, TQueryKey>
  private query: Query<TQueryFnData, TError, TData, TQueryKey>
  private listeners: Set<() => void>
  private unsubscribeFromCache: (() => void) | undefined
  private previousData: TData | undefined

  constructor(
    client: QueryClient,
    options: QueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  ) {
    this.client = client
    this.options = options
    this.listeners = new Set()
    this.query = client.getQueryCache().build(options.queryKey, options)
    this.query.observers.push(this)
    this.unsubscribeFromCache = client.getQueryCache().subscribe((query) => {
      if (query.queryHash === this.query.queryHash) {
        this.notifyListeners()
      }
    })
    QueryLifecycle.cancelGc(this.query)
    QueryLifecycle.applyInitialData(
      this.query,
      this.options,
      this.client.getQueryCache(),
    )
    this.fetchIfNeeded()
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    QueryLifecycle.cancelGc(this.query)

    return () => {
      this.listeners.delete(listener)

      if (this.listeners.size === 0) {
        QueryLifecycle.scheduleGc(
          this.query,
          this.client.getQueryCache(),
          this.options.gcTime ?? defaultGcTime,
        )
      }
    }
  }

  getSnapshot(): QueryObserverResult<TData, TError> {
    const dataResult = this.getResultData()
    const resultStatus = this.query.state.status

    if (!dataResult.isPlaceholderData && dataResult.data !== undefined) {
      this.previousData = dataResult.data
    }

    return {
      data: dataResult.data,
      error: this.query.state.error,
      status: resultStatus,
      fetchStatus: this.query.state.fetchStatus,
      isLoading: resultStatus === 'pending',
      isFetching: this.query.state.fetchStatus === 'fetching',
      isSuccess: resultStatus === 'success',
      isError: resultStatus === 'error',
      isPending: resultStatus === 'pending',
      isStale: QueryUtils.isStale(
        this.query.state.dataUpdatedAt,
        this.options.staleTime,
      ),
      isPlaceholderData: dataResult.isPlaceholderData,
      refetch: () => this.refetch(),
      dataUpdatedAt: this.query.state.dataUpdatedAt,
      errorUpdatedAt: this.query.state.errorUpdatedAt,
      failureCount: this.query.state.fetchFailureCount,
      failureReason: this.query.state.fetchFailureReason,
    }
  }

  updateOptions(
    newOptions: QueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  ): void {
    this.options = newOptions

    const nextQuery = this.client
      .getQueryCache()
      .build(newOptions.queryKey, newOptions)
    this.subscribeToQuery(nextQuery)
    QueryLifecycle.applyInitialData(
      this.query,
      this.options,
      this.client.getQueryCache(),
    )
    this.fetchIfNeeded()
    this.notifyListeners()
  }

  notify(): void {
    this.notifyListeners()
    this.fetchIfNeeded()
  }

  async refetch(): Promise<QueryObserverResult<TData, TError>> {
    await QueryLifecycle.fetchQuery(
      this.query,
      this.options,
      this.client.getQueryCache(),
    )
    return this.getSnapshot()
  }

  destroy(): void {
    this.removeObserver(this.query)
    this.unsubscribeFromCache?.()
    this.unsubscribeFromCache = undefined
    this.listeners.clear()
    QueryLifecycle.scheduleGc(
      this.query,
      this.client.getQueryCache(),
      this.options.gcTime ?? defaultGcTime,
    )
  }

  private subscribeToQuery(
    newQuery: Query<TQueryFnData, TError, TData, TQueryKey>,
  ): void {
    const oldQuery = this.query

    if (oldQuery.queryHash === newQuery.queryHash) {
      return
    }

    this.removeObserver(oldQuery)
    QueryLifecycle.scheduleGc(
      oldQuery,
      this.client.getQueryCache(),
      this.options.gcTime ?? defaultGcTime,
    )
    this.query = newQuery
    this.query.observers.push(this)
    QueryLifecycle.cancelGc(this.query)
  }

  private removeObserver(
    query: Query<TQueryFnData, TError, TData, TQueryKey>,
  ): void {
    const observerIndex = query.observers.indexOf(this)

    if (observerIndex > -1) {
      query.observers.splice(observerIndex, 1)
    }
  }

  private fetchIfNeeded(): void {
    if (QueryLifecycle.shouldFetch(this.query, this.options)) {
      void QueryLifecycle.fetchQuery(
        this.query,
        this.options,
        this.client.getQueryCache(),
      )
    }
  }

  private getResultData(): {
    data: TData | undefined
    isPlaceholderData: boolean
  } {
    if (this.query.state.data !== undefined) {
      if (this.options.select !== undefined) {
        return {
          data: this.options.select(
            this.query.state.data as unknown as TQueryFnData,
          ),
          isPlaceholderData: false,
        }
      }

      return { data: this.query.state.data, isPlaceholderData: false }
    }

    if (this.options.placeholderData === undefined) {
      return { data: undefined, isPlaceholderData: false }
    }

    if (typeof this.options.placeholderData === 'function') {
      const getPlaceholderData = this.options.placeholderData as (
        previousData: TData | undefined,
      ) => TData | undefined

      return {
        data: getPlaceholderData(this.previousData),
        isPlaceholderData: true,
      }
    }

    return { data: this.options.placeholderData, isPlaceholderData: true }
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener()
    }
  }
}
