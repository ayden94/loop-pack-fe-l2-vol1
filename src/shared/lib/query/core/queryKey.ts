import type { Query, QueryFilter, QueryKey } from './types'

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const sortValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sortValue)
  }

  if (!isPlainObject(value)) {
    return value
  }

  return Object.keys(value)
    .sort()
    .reduce<Record<string, unknown>>((accumulator, key) => {
      accumulator[key] = sortValue(value[key])
      return accumulator
    }, {})
}

const stableSerialize = (value: unknown): string => {
  if (value === undefined) {
    return 'undefined'
  }

  return JSON.stringify(sortValue(value))
}

class QueryKeyUtilities {
  static readonly hashQueryKey = (queryKey: QueryKey): string =>
    JSON.stringify(queryKey, (_key, value) => sortValue(value))

  static readonly partialMatchKey = (
    queryKey: QueryKey,
    partialKey: QueryKey,
  ): boolean => {
    if (partialKey.length > queryKey.length) {
      return false
    }

    for (let index = 0; index < partialKey.length; index += 1) {
      if (
        stableSerialize(queryKey[index]) !== stableSerialize(partialKey[index])
      ) {
        return false
      }
    }

    return true
  }

  static readonly matchQuery = (filter: QueryFilter, query: Query): boolean => {
    if (filter.queryKey !== undefined) {
      if (filter.exact === true) {
        if (
          query.queryHash !== QueryKeyUtilities.hashQueryKey(filter.queryKey)
        ) {
          return false
        }
      } else if (
        !QueryKeyUtilities.partialMatchKey(query.queryKey, filter.queryKey)
      ) {
        return false
      }
    }

    if (filter.type !== undefined) {
      if (filter.type === 'active' && query.observers.length === 0) {
        return false
      }

      if (filter.type === 'inactive' && query.observers.length > 0) {
        return false
      }
    }

    if (
      filter.fetchStatus !== undefined &&
      query.state.fetchStatus !== filter.fetchStatus
    ) {
      return false
    }

    if (filter.stale !== undefined && isQueryStale(query) !== filter.stale) {
      return false
    }

    if (filter.predicate !== undefined && !filter.predicate(query)) {
      return false
    }

    return true
  }
}

const isQueryStale = (query: Query): boolean =>
  query.state.status !== 'success' || query.state.dataUpdatedAt === 0

export const hashQueryKey = QueryKeyUtilities.hashQueryKey

export const partialMatchKey = QueryKeyUtilities.partialMatchKey

export const matchQuery = QueryKeyUtilities.matchQuery
