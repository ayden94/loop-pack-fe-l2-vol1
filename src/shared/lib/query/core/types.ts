export type QueryKey = ReadonlyArray<unknown>

export type QueryStatus = 'pending' | 'success' | 'error'

export type FetchStatus = 'fetching' | 'paused' | 'idle'

export type QueryFunctionContext<
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
> = {
  queryKey: TQueryKey
  pageParam: TPageParam
  meta: Record<string, unknown> | undefined
}

export type RetryValue<TError = unknown> =
  | boolean
  | number
  | ((failureCount: number, error: TError) => boolean)

export type RetryDelayValue<TError = unknown> =
  | number
  | ((failureCount: number, error: TError) => number)

export type Query<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = {
  queryKey: TQueryKey
  queryHash: string
  state: QueryState<TData, TError>
  observers: Array<QueryObserverInterface>
  gcTimeout: ReturnType<typeof setTimeout> | undefined
}

export type QueryFilter = {
  queryKey?: QueryKey
  exact?: boolean
  predicate?: (query: Query<unknown, unknown, unknown>) => boolean
  stale?: boolean
  fetchStatus?: FetchStatus
  type?: 'active' | 'inactive' | 'all'
}

export type QueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = {
  queryKey: TQueryKey
  queryFn?: (
    context: QueryFunctionContext<TQueryKey, never>,
  ) => Promise<TQueryFnData>
  enabled?: boolean
  staleTime?: number
  gcTime?: number
  retry?: RetryValue<TError>
  retryDelay?: RetryDelayValue<TError>
  initialData?: TQueryFnData | (() => TQueryFnData)
  initialDataUpdatedAt?: number | (() => number | undefined)
  placeholderData?:
    | TData
    | ((previousData: TData | undefined) => TData | undefined)
  select?: (data: TQueryFnData) => TData
  meta?: Record<string, unknown>
}

export type QueryState<TData, TError> =
  | {
      status: 'pending'
      data: undefined
      error: null
      fetchStatus: FetchStatus
      dataUpdatedAt: number
      errorUpdatedAt: number
      fetchFailureCount: number
      fetchFailureReason: TError | null
    }
  | {
      status: 'success'
      data: TData
      error: null
      fetchStatus: FetchStatus
      dataUpdatedAt: number
      errorUpdatedAt: number
      fetchFailureCount: number
      fetchFailureReason: TError | null
    }
  | {
      status: 'error'
      data: TData | undefined
      error: TError
      fetchStatus: FetchStatus
      dataUpdatedAt: number
      errorUpdatedAt: number
      fetchFailureCount: number
      fetchFailureReason: TError | null
    }

export type QueryObserverInterface = {
  notify: () => void
}

export type QueryObserverResult<TData = unknown, TError = unknown> = {
  data: TData | undefined
  error: TError | null
  status: QueryStatus
  fetchStatus: FetchStatus
  isLoading: boolean
  isFetching: boolean
  isSuccess: boolean
  isError: boolean
  isPending: boolean
  isStale: boolean
  isPlaceholderData: boolean
  refetch: () => Promise<QueryObserverResult<TData, TError>>
  dataUpdatedAt: number
  errorUpdatedAt: number
  failureCount: number
  failureReason: TError | null
}

export type SuspenseQueryObserverResult<
  TData = unknown,
  TError = unknown,
> = Omit<QueryObserverResult<TData, TError>, 'status' | 'data'> & {
  data: TData
  status: Exclude<QueryStatus, 'pending'>
}

export type MutationStatus = 'idle' | 'pending' | 'success' | 'error'

export type MutationOptions<
  TData = unknown,
  TError = unknown,
  TVariables = unknown,
  TContext = void,
> = {
  mutationFn: (variables: TVariables) => Promise<TData>
  onMutate?: (
    variables: TVariables,
  ) => Promise<TContext | undefined> | TContext | undefined
  onSuccess?: (
    data: TData,
    variables: TVariables,
    context: TContext,
  ) => Promise<void> | void
  onError?: (
    error: TError,
    variables: TVariables,
    context: TContext | undefined,
  ) => Promise<void> | void
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
    context: TContext | undefined,
  ) => Promise<void> | void
  retry?: RetryValue<TError>
  retryDelay?: RetryDelayValue<TError>
  meta?: Record<string, unknown>
}

export type MutationState<
  TData = unknown,
  TError = unknown,
  TVariables = unknown,
  TContext = void,
> =
  | {
      status: 'idle'
      data: undefined
      error: null
      variables: undefined
      context: undefined
    }
  | {
      status: 'pending'
      data: undefined
      error: null
      variables: TVariables
      context: TContext | undefined
    }
  | {
      status: 'success'
      data: TData
      error: null
      variables: TVariables
      context: TContext | undefined
    }
  | {
      status: 'error'
      data: undefined
      error: TError
      variables: TVariables
      context: TContext | undefined
    }

export type UseMutationResult<
  TData = unknown,
  TError = unknown,
  TVariables = unknown,
  TContext = unknown,
> = {
  data: TData | undefined
  error: TError | null
  status: MutationStatus
  isIdle: boolean
  isPending: boolean
  isSuccess: boolean
  isError: boolean
  mutate: (
    variables: TVariables,
    options?: Pick<
      MutationOptions<TData, TError, TVariables, TContext>,
      'onSuccess' | 'onError' | 'onSettled'
    >,
  ) => void
  mutateAsync: (
    variables: TVariables,
    options?: Pick<
      MutationOptions<TData, TError, TVariables, TContext>,
      'onSuccess' | 'onError' | 'onSettled'
    >,
  ) => Promise<TData>
  reset: () => void
  variables: TVariables | undefined
  context: TContext | undefined
  failureCount: number
  failureReason: TError | null
}

export type InfiniteData<TData = unknown, TPageParam = unknown> = {
  pages: Array<TData>
  pageParams: Array<TPageParam>
}

export type InfiniteQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = unknown,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
> = Omit<
  QueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  'select' | 'queryFn'
> & {
  queryFn?: (
    context: QueryFunctionContext<TQueryKey, TPageParam>,
  ) => Promise<TQueryFnData>
  initialPageParam: TPageParam
  getNextPageParam: (
    lastPage: TQueryFnData,
    allPages: Array<TQueryFnData>,
    lastPageParam: TPageParam,
    allPageParams: Array<TPageParam>,
  ) => TPageParam | undefined | null | false
  select?: (data: InfiniteData<TQueryFnData, TPageParam>) => TData
}

export type DefaultOptions = {
  queries?: Partial<Omit<QueryOptions, 'queryKey' | 'queryFn'>>
  mutations?: Partial<Omit<MutationOptions, 'mutationFn'>>
}

export type QueryClientConfig = {
  defaultOptions?: DefaultOptions
}
