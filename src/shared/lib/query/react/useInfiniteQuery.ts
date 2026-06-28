import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'

import type {
  InfiniteData,
  InfiniteQueryObserverResult,
  InfiniteQueryOptions,
  QueryKey,
} from '../core'
import { InfiniteQueryObserver } from '../core'
import { useQueryClient } from './useQueryClient'

function useInfiniteQuery<
  TQueryFnData = unknown,
  TError = Error,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
  TData = InfiniteData<TQueryFnData, TPageParam>,
>(
  options: InfiniteQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryKey,
    TPageParam
  >,
): InfiniteQueryObserverResult<TData, TError> {
  const client = useQueryClient()
  const observerRef = useRef<InfiniteQueryObserver<
    TQueryFnData,
    TError,
    TPageParam,
    TQueryKey,
    TData
  > | null>(null)

  if (observerRef.current === null) {
    observerRef.current = new InfiniteQueryObserver(client, options)
  }

  const observer = observerRef.current
  const subscribeRef = useRef<((listener: () => void) => () => void) | null>(
    null,
  )

  if (subscribeRef.current === null) {
    subscribeRef.current = (listener) => observer.subscribe(listener)
  }

  const snapshot = useSyncExternalStore(subscribeRef.current, () =>
    observer.getSnapshot(),
  )

  useEffect(() => {
    return () => {
      observer.destroy()

      if (observerRef.current === observer) {
        observerRef.current = null
      }
    }
  }, [observer])

  const fetchNextPage = useCallback(() => {
    return observer.fetchNextPage()
  }, [observer])

  return {
    ...snapshot,
    fetchNextPage,
  }
}

export { useInfiniteQuery }
