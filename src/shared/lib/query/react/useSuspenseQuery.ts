import { useEffect, useRef, useSyncExternalStore } from 'react'

import type {
  QueryKey,
  QueryOptions,
  SuspenseQueryObserverResult,
} from '../core'
import { QueryObserver } from '../core'
import { useQueryClient } from './useQueryClient'

type SuspenseQueryOptions<
  TQueryFnData = unknown,
  TError extends Error = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
> = Omit<
  QueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  'enabled' | 'placeholderData'
>

class SuspenseBoundarySignal extends Error {
  private readonly inner: Promise<void>

  constructor(promise: Promise<void>) {
    super('SuspenseBoundarySignal')
    this.inner = promise
  }

  then(onFulfilled: () => void): Promise<void> {
    return this.inner.then(onFulfilled)
  }
}

function useSuspenseQuery<
  TQueryFnData = unknown,
  TError extends Error = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: SuspenseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
): SuspenseQueryObserverResult<TData, TError> {
  const client = useQueryClient()
  const observerRef = useRef<QueryObserver<
    TQueryFnData,
    TError,
    TData,
    TQueryKey
  > | null>(null)

  if (observerRef.current === null) {
    observerRef.current = new QueryObserver(client, {
      ...options,
      enabled: true,
    })
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
    observer.updateOptions({ ...options, enabled: true })
  })

  useEffect(() => {
    return () => {
      observer.destroy()

      if (observerRef.current === observer) {
        observerRef.current = null
      }
    }
  }, [observer])

  if (snapshot.status === 'pending') {
    throw new SuspenseBoundarySignal(
      new Promise<void>((resolve) => {
        const unsubscribe = observer.subscribe(() => {
          if (observer.getSnapshot().status !== 'pending') {
            resolve()
            unsubscribe()
          }
        })
      }),
    )
  }

  if (snapshot.status === 'error' && snapshot.error !== null) {
    throw snapshot.error
  }

  if (snapshot.data === undefined) {
    throw new Error('Suspense query resolved without data')
  }

  return {
    ...snapshot,
    data: snapshot.data,
    status: snapshot.status,
  }
}

export type { SuspenseQueryOptions }
export { useSuspenseQuery }
