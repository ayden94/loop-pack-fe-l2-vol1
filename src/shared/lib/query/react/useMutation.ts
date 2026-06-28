import { useCallback, useRef, useSyncExternalStore } from 'react'

import type { MutationOptions, UseMutationResult } from '../core'
import { MutationObserver } from '../core'
import { useQueryClient } from './useQueryClient'

type MutationCallbackOptions<
  TData,
  TError extends Error,
  TVariables,
  TContext,
> = Pick<
  MutationOptions<TData, TError, TVariables, TContext>,
  'onSuccess' | 'onError' | 'onSettled'
>

function useMutation<
  TData = unknown,
  TError extends Error = Error,
  TVariables = void,
  TContext = unknown,
>(
  options: MutationOptions<TData, TError, TVariables, TContext>,
): UseMutationResult<TData, TError, TVariables, TContext> {
  const client = useQueryClient()
  const observerRef = useRef<MutationObserver<
    TData,
    TError,
    TVariables,
    TContext
  > | null>(null)

  if (observerRef.current === null) {
    observerRef.current = new MutationObserver(
      client.getMutationCache(),
      options,
    )
  }

  const observer = observerRef.current
  observer.updateOptions(options)

  const subscribeRef = useRef<((listener: () => void) => () => void) | null>(
    null,
  )

  if (subscribeRef.current === null) {
    subscribeRef.current = (listener) => observer.subscribe(listener)
  }

  const snapshot = useSyncExternalStore(subscribeRef.current, () =>
    observer.getSnapshot(),
  )

  const mutate = useCallback(
    (
      variables: TVariables,
      overrideOptions?: MutationCallbackOptions<
        TData,
        TError,
        TVariables,
        TContext
      >,
    ) => {
      observer.mutate(variables, overrideOptions)
    },
    [observer],
  )

  const mutateAsync = useCallback(
    (
      variables: TVariables,
      overrideOptions?: MutationCallbackOptions<
        TData,
        TError,
        TVariables,
        TContext
      >,
    ) => {
      return observer.mutateAsync(variables, overrideOptions)
    },
    [observer],
  )

  const reset = useCallback(() => {
    observer.reset()
  }, [observer])

  return {
    data: snapshot.status === 'success' ? snapshot.data : undefined,
    error: snapshot.status === 'error' ? snapshot.error : null,
    status: snapshot.status,
    isIdle: snapshot.status === 'idle',
    isPending: snapshot.status === 'pending',
    isSuccess: snapshot.status === 'success',
    isError: snapshot.status === 'error',
    mutate,
    mutateAsync,
    reset,
    variables: snapshot.variables,
    context: snapshot.context,
    // MutationState does not currently track retry metadata.
    failureCount: 0,
    failureReason: null,
  }
}

export { useMutation }
