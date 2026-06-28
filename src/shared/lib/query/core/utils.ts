import type { RetryDelayValue, RetryValue } from './types'

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype

const areSameKeys = (
  oldObject: Record<string, unknown>,
  newObject: Record<string, unknown>,
): boolean => {
  const oldKeys = Object.keys(oldObject)
  const newKeys = Object.keys(newObject)

  if (oldKeys.length !== newKeys.length) {
    return false
  }

  for (const key of newKeys) {
    if (!Object.hasOwn(oldObject, key)) {
      return false
    }
  }

  return true
}

const shareArrayValues = <T>(
  oldData: ReadonlyArray<T>,
  newData: ReadonlyArray<T>,
): Array<T> => {
  const shared = new Array<T>(newData.length)
  let isSame = oldData.length === newData.length

  for (let index = 0; index < newData.length; index += 1) {
    const sharedValue = QueryUtils.applyStructuralSharing(
      oldData[index],
      newData[index],
    )
    shared[index] = sharedValue

    if (isSame && sharedValue !== oldData[index]) {
      isSame = false
    }
  }

  return isSame ? (oldData as Array<T>) : shared
}

const shareObjectValues = <T extends Record<string, unknown>>(
  oldData: T,
  newData: T,
): T => {
  const shared: Record<string, unknown> = {}
  let isSame = areSameKeys(oldData, newData)

  for (const key of Object.keys(newData)) {
    const sharedValue = QueryUtils.applyStructuralSharing(
      oldData[key],
      newData[key],
    )
    shared[key] = sharedValue

    if (isSame && sharedValue !== oldData[key]) {
      isSame = false
    }
  }

  return isSame ? oldData : (shared as T)
}

export class QueryUtils {
  static shouldRetry<TError>(
    retry: RetryValue<TError> | undefined,
    failureCount: number,
    error: TError,
  ): boolean {
    if (retry === false || retry === 0) {
      return false
    }

    if (retry === true) {
      return true
    }

    if (typeof retry === 'number') {
      return failureCount < retry
    }

    if (typeof retry === 'function') {
      return retry(failureCount, error)
    }

    return failureCount < 3
  }

  static getRetryDelay<TError>(
    retryDelay: RetryDelayValue<TError> | undefined,
    failureCount: number,
    error: TError,
  ): number {
    if (typeof retryDelay === 'number') {
      return retryDelay
    }

    if (typeof retryDelay === 'function') {
      return retryDelay(failureCount, error)
    }

    return Math.min(1000 * 2 ** failureCount, 30000)
  }

  static isStale(
    dataUpdatedAt: number,
    staleTime: number | undefined,
  ): boolean {
    if (dataUpdatedAt === 0) {
      return true
    }

    if (staleTime === Infinity) {
      return false
    }

    if (staleTime === 0 || staleTime === undefined) {
      return true
    }

    return Date.now() - dataUpdatedAt > staleTime
  }

  static getEffectiveStaleTime(staleTime: number | undefined): number {
    return staleTime ?? 0
  }

  static applyStructuralSharing<T>(oldData: T, newData: T): T {
    if (Object.is(oldData, newData)) {
      return oldData
    }

    const oldIsArray = Array.isArray(oldData)
    const newIsArray = Array.isArray(newData)

    if (oldIsArray !== newIsArray) {
      return newData
    }

    const oldIsPlainObject = isPlainObject(oldData)
    const newIsPlainObject = isPlainObject(newData)

    if (oldIsArray && newIsArray) {
      return shareArrayValues(oldData, newData) as T
    }

    if (oldIsPlainObject && newIsPlainObject) {
      return shareObjectValues(oldData, newData)
    }

    return newData
  }

  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }
}
