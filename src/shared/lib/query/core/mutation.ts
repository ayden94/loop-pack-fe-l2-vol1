import type { MutationCache, MutationRecord } from './mutationCache'
import type { MutationOptions, MutationState } from './types'
import { QueryUtils } from './utils'

type MutationCallbackOptions<
  TData,
  TError extends Error,
  TVariables,
  TContext,
> = Pick<
  MutationOptions<TData, TError, TVariables, TContext>,
  'onSuccess' | 'onError' | 'onSettled'
>

type MutationExecutionResult<
  TData,
  TError extends Error,
  TVariables,
  TContext,
> = {
  data: TData
  variables: TVariables
  context: TContext | undefined
  options: MutationOptions<TData, TError, TVariables, TContext>
  overrideOptions: MutationCallbackOptions<TData, TError, TVariables, TContext>
}

type MutationErrorResult<TError extends Error, TVariables, TContext> = {
  error: TError
  variables: TVariables
  context: TContext | undefined
}

type MutationCacheProvider = {
  getMutationCache: () => MutationCache
}

export class MutationLifecycle {
  static async execute<TData, TError extends Error, TVariables, TContext>(
    variables: TVariables,
    options: MutationOptions<TData, TError, TVariables, TContext>,
    overrideOptions: MutationCallbackOptions<
      TData,
      TError,
      TVariables,
      TContext
    >,
    handleContext: (context: TContext | undefined) => void,
  ): Promise<MutationExecutionResult<TData, TError, TVariables, TContext>> {
    const context = await options.onMutate?.(variables)
    handleContext(context)

    let failureCount = 0

    for (;;) {
      try {
        const data = await options.mutationFn(variables)
        return {
          data,
          variables,
          context,
          options,
          overrideOptions,
        }
      } catch (unknownError) {
        failureCount += 1

        const error = unknownError as TError
        const shouldRetry = QueryUtils.shouldRetry(
          options.retry ?? 0,
          failureCount,
          error,
        )

        if (!shouldRetry) {
          throw error
        }

        const retryDelay = QueryUtils.getRetryDelay(
          options.retryDelay,
          failureCount,
          error,
        )
        await QueryUtils.sleep(retryDelay)
      }
    }
  }

  static async notifySuccess<TData, TError extends Error, TVariables, TContext>(
    result: MutationExecutionResult<TData, TError, TVariables, TContext>,
  ): Promise<void> {
    const callbackContext = MutationLifecycle.requireContext(result.context)

    await result.options.onSuccess?.(
      result.data,
      result.variables,
      callbackContext,
    )
    await result.overrideOptions.onSuccess?.(
      result.data,
      result.variables,
      callbackContext,
    )
    await result.options.onSettled?.(
      result.data,
      null,
      result.variables,
      result.context,
    )
    await result.overrideOptions.onSettled?.(
      result.data,
      null,
      result.variables,
      result.context,
    )
  }

  static async notifyError<TData, TError extends Error, TVariables, TContext>(
    result: MutationErrorResult<TError, TVariables, TContext>,
    options: MutationOptions<TData, TError, TVariables, TContext>,
    overrideOptions: MutationCallbackOptions<
      TData,
      TError,
      TVariables,
      TContext
    >,
  ): Promise<void> {
    await options.onError?.(result.error, result.variables, result.context)
    await overrideOptions.onError?.(
      result.error,
      result.variables,
      result.context,
    )
    await options.onSettled?.(
      undefined,
      result.error,
      result.variables,
      result.context,
    )
    await overrideOptions.onSettled?.(
      undefined,
      result.error,
      result.variables,
      result.context,
    )
  }

  private static requireContext<TContext>(
    context: TContext | undefined,
  ): TContext {
    return context as TContext
  }
}

export class MutationObserver<
  TData,
  TError extends Error,
  TVariables,
  TContext,
> {
  private readonly cache: MutationCache
  private readonly record: MutationRecord<TData, TError, TVariables, TContext>
  private readonly currentListeners: Set<() => void>
  private globalOptions: MutationOptions<TData, TError, TVariables, TContext>

  constructor(
    cacheOrClient: MutationCache | MutationCacheProvider,
    options: MutationOptions<TData, TError, TVariables, TContext>,
  ) {
    this.cache = MutationObserver.resolveCache(cacheOrClient)
    this.globalOptions = options
    this.record = this.cache.add(options)
    this.currentListeners = new Set()
  }

  private static resolveCache(
    cacheOrClient: MutationCache | MutationCacheProvider,
  ): MutationCache {
    if ('getMutationCache' in cacheOrClient) {
      return cacheOrClient.getMutationCache()
    }

    return cacheOrClient
  }

  subscribe(listener: () => void): () => void {
    this.currentListeners.add(listener)
    return () => {
      this.currentListeners.delete(listener)
    }
  }

  getSnapshot(): MutationState<TData, TError, TVariables, TContext> {
    return this.record.state
  }

  updateOptions(
    options: MutationOptions<TData, TError, TVariables, TContext>,
  ): void {
    this.globalOptions = options
    this.record.options = options
  }

  mutate(
    variables: TVariables,
    overrideOptions: MutationCallbackOptions<
      TData,
      TError,
      TVariables,
      TContext
    > = {},
  ): void {
    void this.mutateAsync(variables, overrideOptions).catch(() => undefined)
  }

  async mutateAsync(
    variables: TVariables,
    overrideOptions: MutationCallbackOptions<
      TData,
      TError,
      TVariables,
      TContext
    > = {},
  ): Promise<TData> {
    let context: TContext | undefined
    this.setPendingState(variables)

    try {
      const result = await MutationLifecycle.execute(
        variables,
        this.globalOptions,
        overrideOptions,
        (nextContext) => {
          context = nextContext
          this.setContextState(variables, nextContext)
        },
      )

      this.setSuccessState(result.data, variables, result.context)
      await MutationLifecycle.notifySuccess(result)
      return result.data
    } catch (unknownError) {
      const error = unknownError as TError
      this.setErrorState(error, variables, context)
      await MutationLifecycle.notifyError(
        { error, variables, context },
        this.globalOptions,
        overrideOptions,
      )
      throw error
    }
  }

  reset(): void {
    const idleState: MutationState<TData, TError, TVariables, TContext> = {
      status: 'idle',
      data: undefined,
      error: null,
      variables: undefined,
      context: undefined,
    }

    this.cache.update(this.record, idleState)
    this.notifyListeners()
  }

  destroy(): void {
    this.currentListeners.clear()
    this.cache.remove(this.record)
  }

  private setPendingState(variables: TVariables): void {
    const pendingState: MutationState<TData, TError, TVariables, TContext> = {
      status: 'pending',
      data: undefined,
      error: null,
      variables,
      context: undefined,
    }

    this.cache.update(this.record, pendingState)
    this.notifyListeners()
  }

  private setContextState(
    variables: TVariables,
    context: TContext | undefined,
  ): void {
    const pendingState: MutationState<TData, TError, TVariables, TContext> = {
      status: 'pending',
      data: undefined,
      error: null,
      variables,
      context,
    }

    this.cache.update(this.record, pendingState)
    this.notifyListeners()
  }

  private setSuccessState(
    data: TData,
    variables: TVariables,
    context: TContext | undefined,
  ): void {
    const successState: MutationState<TData, TError, TVariables, TContext> = {
      status: 'success',
      data,
      error: null,
      variables,
      context,
    }

    this.cache.update(this.record, successState)
    this.notifyListeners()
  }

  private setErrorState(
    error: TError,
    variables: TVariables,
    context: TContext | undefined,
  ): void {
    const errorState: MutationState<TData, TError, TVariables, TContext> = {
      status: 'error',
      data: undefined,
      error,
      variables,
      context,
    }

    this.cache.update(this.record, errorState)
    this.notifyListeners()
  }

  private notifyListeners(): void {
    for (const listener of this.currentListeners) {
      listener()
    }
  }
}
