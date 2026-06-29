import type {
  InfiniteQueryOptions,
  MutationOptions,
  QueryKey,
  QueryOptions,
} from './types'

function queryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: QueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): QueryOptions<TQueryFnData, TError, TData, TQueryKey> {
  return options
}

function mutationOptions<
  TData = unknown,
  TError = unknown,
  TVariables = unknown,
  TContext = void,
>(
  options: MutationOptions<TData, TError, TVariables, TContext>,
): MutationOptions<TData, TError, TVariables, TContext> {
  return options
}

function infiniteQueryOptions<
  TQueryFnData = unknown,
  TError = unknown,
  TData = unknown,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(
  options: InfiniteQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryKey,
    TPageParam
  >,
): InfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam> {
  return options
}

export { infiniteQueryOptions, mutationOptions, queryOptions }
