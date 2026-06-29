import type { QueryKey } from '../core'
import type { SuspenseQueryOptions } from './useSuspenseQuery'

function suspenseQueryOptions<
  TQueryFnData = unknown,
  TError extends Error = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: SuspenseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): SuspenseQueryOptions<TQueryFnData, TError, TData, TQueryKey> {
  return options
}

export { suspenseQueryOptions }
