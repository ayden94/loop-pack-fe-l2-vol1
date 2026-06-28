import { MutationCache } from './mutationCache'
import { QueryCache } from './queryCache'
import type {
  DefaultOptions,
  QueryClientConfig,
  QueryFilter,
  QueryKey,
} from './types'

export class QueryClient {
  private readonly queryCache: QueryCache
  private readonly mutationCache: MutationCache
  private readonly config: QueryClientConfig

  constructor(config: QueryClientConfig = {}) {
    this.queryCache = new QueryCache()
    this.mutationCache = new MutationCache()
    this.config = config
  }

  getQueryCache(): QueryCache {
    return this.queryCache
  }

  getMutationCache(): MutationCache {
    return this.mutationCache
  }

  getDefaultOptions(): DefaultOptions | undefined {
    return this.config.defaultOptions
  }

  getQueryData(queryKey: QueryKey): unknown {
    void queryKey
    return undefined
  }

  setQueryData<TData>(
    queryKey: QueryKey,
    updater: TData | ((oldData: TData | undefined) => TData),
  ): TData {
    void queryKey
    void updater
    throw new Error('QueryClient.setQueryData is not implemented yet')
  }

  invalidateQueries(_filter?: QueryFilter): Promise<void> {
    return Promise.resolve()
  }

  refetchQueries(_filter?: QueryFilter): Promise<void> {
    return Promise.resolve()
  }
}
