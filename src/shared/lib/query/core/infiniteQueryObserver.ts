import { QueryLifecycle } from './query'
import type { QueryClient } from './queryClient'
import type {
  InfiniteData,
  InfiniteQueryOptions,
  Query,
  QueryFunctionContext,
  QueryKey,
  QueryObserverInterface,
  QueryObserverResult,
  QueryState,
} from './types'
import { QueryUtils } from './utils'

const defaultGcTime = 5 * 60 * 1000

export type InfiniteQueryObserverResult<TData, TError> = QueryObserverResult<
  TData,
  TError
> & {
  fetchNextPage: () => Promise<InfiniteQueryObserverResult<TData, TError>>
  hasNextPage: boolean
  isFetchingNextPage: boolean
}

export class InfiniteQueryObserver<
  TQueryFnData,
  TError,
  TPageParam = unknown,
  TQueryKey extends QueryKey = QueryKey,
  TData = InfiniteData<TQueryFnData, TPageParam>,
> implements QueryObserverInterface {
  private readonly client: QueryClient
  private readonly options: InfiniteQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryKey,
    TPageParam
  >
  private readonly query: Query<
    InfiniteData<TQueryFnData, TPageParam>,
    TError,
    InfiniteData<TQueryFnData, TPageParam>,
    TQueryKey
  >
  private readonly listeners: Set<() => void>
  private unsubscribeFromCache: (() => void) | undefined
  private fetchingNextPage = false

  constructor(
    client: QueryClient,
    options: InfiniteQueryOptions<
      TQueryFnData,
      TError,
      TData,
      TQueryKey,
      TPageParam
    >,
  ) {
    this.client = client
    this.options = options
    this.listeners = new Set()
    this.query = client
      .getQueryCache()
      .build<
        InfiniteData<TQueryFnData, TPageParam>,
        TError,
        InfiniteData<TQueryFnData, TPageParam>,
        TQueryKey
      >(options.queryKey)
    this.query.observers.push(this)
    this.unsubscribeFromCache = client.getQueryCache().subscribe((query) => {
      if (query.queryHash === this.query.queryHash) {
        this.notifyListeners()
      }
    })
    QueryLifecycle.cancelGc(this.query)
    this.fetchFirstPageIfNeeded()
  }

  subscribe(listener: () => void): () => void {
    this.addObserver(this.query)
    this.listeners.add(listener)
    QueryLifecycle.cancelGc(this.query)

    return () => {
      this.listeners.delete(listener)

      if (this.listeners.size === 0) {
        this.removeObserver(this.query)
        QueryLifecycle.scheduleGc(
          this.query,
          this.client.getQueryCache(),
          this.options.gcTime ?? defaultGcTime,
        )
      }
    }
  }

  getSnapshot(): InfiniteQueryObserverResult<TData, TError> {
    const infiniteData = this.getInfiniteData()
    const hasNextPage =
      infiniteData !== undefined ? this.computeHasNextPage(infiniteData) : false
    const resultStatus = this.query.state.status

    let data: TData | undefined

    if (infiniteData !== undefined) {
      if (this.options.select !== undefined) {
        data = this.options.select(infiniteData)
      } else {
        data = infiniteData as unknown as TData
      }
    }

    return {
      data,
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
      isPlaceholderData: false,
      refetch: () => this.refetch(),
      dataUpdatedAt: this.query.state.dataUpdatedAt,
      errorUpdatedAt: this.query.state.errorUpdatedAt,
      failureCount: this.query.state.fetchFailureCount,
      failureReason: this.query.state.fetchFailureReason,
      fetchNextPage: () => this.fetchNextPage(),
      hasNextPage,
      isFetchingNextPage: this.fetchingNextPage,
    }
  }

  async fetchNextPage(): Promise<InfiniteQueryObserverResult<TData, TError>> {
    const existingInfiniteData = this.getInfiniteData()

    if (existingInfiniteData === undefined) {
      await this.fetchAndAppendPage(this.options.initialPageParam, false)
      return this.getSnapshot()
    }

    const lastPage =
      existingInfiniteData.pages[existingInfiniteData.pages.length - 1]
    const lastPageParam =
      existingInfiniteData.pageParams[
        existingInfiniteData.pageParams.length - 1
      ]

    if (lastPage === undefined) {
      return this.getSnapshot()
    }

    const nextPageParam = this.options.getNextPageParam(
      lastPage,
      existingInfiniteData.pages,
      lastPageParam,
      existingInfiniteData.pageParams,
    )

    if (
      nextPageParam === undefined ||
      nextPageParam === null ||
      nextPageParam === false
    ) {
      return this.getSnapshot()
    }

    await this.fetchAndAppendPage(nextPageParam, true)
    return this.getSnapshot()
  }

  notify(): void {
    this.notifyListeners()
    this.fetchFirstPageIfNeeded()
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

  private async refetch(): Promise<InfiniteQueryObserverResult<TData, TError>> {
    await this.fetchAndAppendPage(this.options.initialPageParam, false)
    return this.getSnapshot()
  }

  private fetchFirstPageIfNeeded(): void {
    if (QueryLifecycle.shouldFetch(this.query, this.options)) {
      void this.fetchAndAppendPage(this.options.initialPageParam, false)
    }
  }

  private async fetchAndAppendPage(
    pageParam: TPageParam,
    appendToExisting: boolean,
  ): Promise<void> {
    if (this.query.state.fetchStatus === 'fetching') {
      return
    }

    this.fetchingNextPage = appendToExisting

    const cache = this.client.getQueryCache()
    cache.setState(this.query, { ...this.query.state, fetchStatus: 'fetching' })

    try {
      const pageData = await this.fetchPage(pageParam)
      const existingInfiniteData = this.getInfiniteData()

      const newInfiniteData: InfiniteData<TQueryFnData, TPageParam> =
        existingInfiniteData !== undefined && appendToExisting
          ? {
              pages: [...existingInfiniteData.pages, pageData],
              pageParams: [...existingInfiniteData.pageParams, pageParam],
            }
          : { pages: [pageData], pageParams: [pageParam] }

      const sharedData =
        existingInfiniteData === undefined
          ? newInfiniteData
          : QueryUtils.applyStructuralSharing(
              existingInfiniteData,
              newInfiniteData,
            )

      const successState: QueryState<
        InfiniteData<TQueryFnData, TPageParam>,
        TError
      > = {
        status: 'success',
        data: sharedData,
        error: null,
        fetchStatus: 'idle',
        dataUpdatedAt: Date.now(),
        errorUpdatedAt: this.query.state.errorUpdatedAt,
        fetchFailureCount: 0,
        fetchFailureReason: null,
      }

      cache.setState(this.query, successState)
    } catch (unknownError) {
      const error = unknownError as TError
      const errorState: QueryState<
        InfiniteData<TQueryFnData, TPageParam>,
        TError
      > = {
        status: 'error',
        data: this.query.state.data,
        error,
        fetchStatus: 'idle',
        dataUpdatedAt: this.query.state.dataUpdatedAt,
        errorUpdatedAt: Date.now(),
        fetchFailureCount: this.query.state.fetchFailureCount + 1,
        fetchFailureReason: error,
      }
      cache.setState(this.query, errorState)
    } finally {
      this.fetchingNextPage = false
    }
  }

  private async fetchPage(pageParam: TPageParam): Promise<TQueryFnData> {
    if (this.options.queryFn === undefined) {
      throw new Error('queryFn is required')
    }

    const context: QueryFunctionContext<TQueryKey, TPageParam> = {
      queryKey: this.query.queryKey,
      pageParam,
      meta: this.options.meta,
    }

    const data: TQueryFnData | undefined = await this.options.queryFn(context)

    if (data === undefined) {
      throw new Error('Query data cannot be undefined')
    }

    return data
  }

  private getInfiniteData():
    | InfiniteData<TQueryFnData, TPageParam>
    | undefined {
    if (this.query.state.status === 'success') {
      return this.query.state.data
    }

    return undefined
  }

  private computeHasNextPage(
    infiniteData: InfiniteData<TQueryFnData, TPageParam>,
  ): boolean {
    const lastPage = infiniteData.pages[infiniteData.pages.length - 1]
    const lastPageParam =
      infiniteData.pageParams[infiniteData.pageParams.length - 1]

    if (lastPage === undefined) {
      return false
    }

    const nextParam = this.options.getNextPageParam(
      lastPage,
      infiniteData.pages,
      lastPageParam,
      infiniteData.pageParams,
    )

    return nextParam !== undefined && nextParam !== null && nextParam !== false
  }

  private removeObserver(
    query: Query<
      InfiniteData<TQueryFnData, TPageParam>,
      TError,
      InfiniteData<TQueryFnData, TPageParam>,
      TQueryKey
    >,
  ): void {
    const observerIndex = query.observers.indexOf(this)

    if (observerIndex > -1) {
      query.observers.splice(observerIndex, 1)
    }
  }

  private addObserver(
    query: Query<
      InfiniteData<TQueryFnData, TPageParam>,
      TError,
      InfiniteData<TQueryFnData, TPageParam>,
      TQueryKey
    >,
  ): void {
    if (!query.observers.includes(this)) {
      query.observers.push(this)
    }
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener()
    }
  }
}
