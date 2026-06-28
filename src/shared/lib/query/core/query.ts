import type { QueryCache } from './queryCache'
import type {
  Query,
  QueryFunctionContext,
  QueryKey,
  QueryOptions,
  QueryState,
} from './types'
import { QueryUtils } from './utils'

const defaultGcTime = 5 * 60 * 1000

export class QueryLifecycle {
  static async fetchQuery<
    TQueryFnData,
    TError,
    TData,
    TQueryKey extends QueryKey,
  >(
    query: Query<TQueryFnData, TError, TData, TQueryKey>,
    options: QueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    cache: QueryCache,
  ): Promise<void> {
    if (query.state.fetchStatus === 'fetching') {
      return
    }

    cache.setState(query, {
      ...query.state,
      fetchStatus: 'fetching',
    })

    let failureCount = 0

    for (;;) {
      try {
        const queryFnData = await QueryLifecycle.executeQueryFn(
          query.queryKey,
          options,
        )
        const selectedData = QueryLifecycle.selectData(queryFnData, options)
        const sharedData =
          query.state.data === undefined
            ? selectedData
            : QueryUtils.applyStructuralSharing(query.state.data, selectedData)
        const successState: QueryState<TData, TError> = {
          status: 'success',
          data: sharedData,
          error: null,
          fetchStatus: 'idle',
          dataUpdatedAt: Date.now(),
          errorUpdatedAt: query.state.errorUpdatedAt,
          fetchFailureCount: 0,
          fetchFailureReason: null,
        }

        cache.setState(query, successState)
        QueryLifecycle.scheduleGc(query, cache, options.gcTime ?? defaultGcTime)
        return
      } catch (unknownError) {
        failureCount += 1

        const error = unknownError as TError
        const shouldRetry = QueryUtils.shouldRetry(
          options.retry,
          failureCount,
          error,
        )

        if (!shouldRetry) {
          const errorState: QueryState<TData, TError> = {
            status: 'error',
            data: query.state.data,
            error,
            fetchStatus: 'idle',
            dataUpdatedAt: query.state.dataUpdatedAt,
            errorUpdatedAt: Date.now(),
            fetchFailureCount: failureCount,
            fetchFailureReason: error,
          }

          cache.setState(query, errorState)
          QueryLifecycle.scheduleGc(
            query,
            cache,
            options.gcTime ?? defaultGcTime,
          )
          return
        }

        const retryDelay = QueryUtils.getRetryDelay(
          options.retryDelay,
          failureCount,
          error,
        )
        await QueryUtils.sleep(retryDelay)
        cache.setState(query, {
          ...query.state,
          fetchFailureCount: failureCount,
          fetchFailureReason: error,
        })
      }
    }
  }

  static scheduleGc<TQueryFnData, TError, TData, TQueryKey extends QueryKey>(
    query: Query<TQueryFnData, TError, TData, TQueryKey>,
    cache: QueryCache,
    gcTime: number,
  ): void {
    QueryLifecycle.cancelGc(query)

    if (query.observers.length > 0 || !Number.isFinite(gcTime)) {
      return
    }

    query.gcTimeout = setTimeout(() => {
      cache.remove(query)
    }, gcTime)
  }

  static cancelGc<TQueryFnData, TError, TData, TQueryKey extends QueryKey>(
    query: Query<TQueryFnData, TError, TData, TQueryKey>,
  ): void {
    if (query.gcTimeout === undefined) {
      return
    }

    clearTimeout(query.gcTimeout)
    query.gcTimeout = undefined
  }

  static shouldFetch<TQueryFnData, TError, TData, TQueryKey extends QueryKey>(
    query: Query<TQueryFnData, TError, TData, TQueryKey>,
    options: Pick<
      QueryOptions<TQueryFnData, TError, TData, TQueryKey>,
      'enabled' | 'staleTime'
    >,
  ): boolean {
    if (options.enabled === false || query.state.fetchStatus === 'fetching') {
      return false
    }

    if (query.state.status === 'pending' && query.state.dataUpdatedAt === 0) {
      return true
    }

    return QueryUtils.isStale(query.state.dataUpdatedAt, options.staleTime)
  }

  static applyInitialData<
    TQueryFnData,
    TError,
    TData,
    TQueryKey extends QueryKey,
  >(
    query: Query<TQueryFnData, TError, TData, TQueryKey>,
    options: QueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    cache: QueryCache,
  ): void {
    if (options.initialData === undefined || query.state.dataUpdatedAt !== 0) {
      return
    }

    const queryFnData = QueryLifecycle.resolveInitialData(options.initialData)
    const selectedData = QueryLifecycle.selectData(queryFnData, options)
    const dataUpdatedAt = QueryLifecycle.resolveInitialDataUpdatedAt(
      options.initialDataUpdatedAt,
    )
    const successState: QueryState<TData, TError> = {
      status: 'success',
      data: selectedData,
      error: null,
      fetchStatus: 'idle',
      dataUpdatedAt: dataUpdatedAt ?? Date.now(),
      errorUpdatedAt: 0,
      fetchFailureCount: 0,
      fetchFailureReason: null,
    }

    cache.setState(query, successState)
  }

  private static async executeQueryFn<TQueryFnData, TQueryKey extends QueryKey>(
    queryKey: TQueryKey,
    options: Pick<
      QueryOptions<TQueryFnData, unknown, unknown, TQueryKey>,
      'meta' | 'queryFn'
    >,
  ): Promise<TQueryFnData> {
    if (options.queryFn === undefined) {
      throw new Error('Query function is required')
    }

    const context: QueryFunctionContext<TQueryKey, never> = {
      queryKey,
      pageParam: undefined as never,
      meta: options.meta,
    }
    const queryFnData: TQueryFnData | undefined = await options.queryFn(context)

    if (queryFnData === undefined) {
      throw new Error('Query data cannot be undefined')
    }

    return queryFnData
  }

  private static resolveInitialData<TQueryFnData>(
    initialData: TQueryFnData | (() => TQueryFnData),
  ): TQueryFnData {
    if (typeof initialData === 'function') {
      const initialDataFactory = initialData as () => TQueryFnData
      return initialDataFactory()
    }

    return initialData
  }

  private static resolveInitialDataUpdatedAt(
    initialDataUpdatedAt: number | (() => number | undefined) | undefined,
  ): number | undefined {
    if (typeof initialDataUpdatedAt === 'function') {
      return initialDataUpdatedAt()
    }

    return initialDataUpdatedAt
  }

  private static selectData<
    TQueryFnData,
    TError,
    TData,
    TQueryKey extends QueryKey,
  >(
    queryFnData: TQueryFnData,
    options: QueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  ): TData {
    if (options.select !== undefined) {
      return options.select(queryFnData)
    }

    return queryFnData as unknown as TData
  }
}
