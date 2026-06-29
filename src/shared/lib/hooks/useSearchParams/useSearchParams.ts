import { useCallback, useMemo, useSyncExternalStore } from 'react'

import { SearchParamsValue } from './storage'
import type { SearchParamsSetState, UseSearchParamsReturn } from './types'

const subscribeToSearchParams = (listener: () => void) =>
  SearchParamsValue.subscribe(listener)
const getSearchParamsSnapshot = () => SearchParamsValue.getSnapshot()
const getSearchParamsServerSnapshot = () =>
  SearchParamsValue.getServerSnapshot()

export function useSearchParams<
  TParams extends object,
>(): UseSearchParamsReturn<TParams> {
  const serializedSearchParams = useSyncExternalStore(
    subscribeToSearchParams,
    getSearchParamsSnapshot,
    getSearchParamsServerSnapshot,
  )

  const searchParams = useMemo(
    () => SearchParamsValue.read<TParams>(serializedSearchParams),
    [serializedSearchParams],
  )

  const setSearchParams = useCallback<SearchParamsSetState<TParams>>(
    (nextParams) => {
      const resolvedParams =
        typeof nextParams === 'function'
          ? nextParams(SearchParamsValue.read<TParams>(window.location.search))
          : nextParams

      SearchParamsValue.write(resolvedParams)
    },
    [],
  )

  return [searchParams, setSearchParams]
}
