import { useEffect, useRef, useSyncExternalStore } from 'react'

import type { QueryKey, QueryObserverResult, QueryOptions } from '../core'
import { QueryObserver } from '../core'
import { useQueryClient } from './useQueryClient'

function useQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: QueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): QueryObserverResult<TData, TError> {
  const client = useQueryClient()
  const observerRef = useRef<QueryObserver<
    TQueryFnData,
    TError,
    TData,
    TQueryKey
  > | null>(null)

  if (observerRef.current === null) {
    observerRef.current = new QueryObserver(client, options)
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
    observer.updateOptions(options)
  })

  useEffect(() => {
    return () => {
      observer.destroy()

      if (observerRef.current === observer) {
        observerRef.current = null
      }
    }
  }, [observer])

  return snapshot
}

export { useQuery }
