import { apiClient } from '@/shared/api/ApiClient'
import type {
  HomeResponse,
  ProductListQuery,
  ProductListResponse,
} from '@/types/commerce'

export class ProductRepository {
  constructor(private readonly api: typeof apiClient = apiClient) {}

  readonly endpoints = {
    home: 'api/home',
    products: 'api/products',
  } as const

  getHome(): Promise<HomeResponse> {
    return this.api.get(this.endpoints.home).json<HomeResponse>()
  }

  getProductList(query: ProductListQuery): Promise<ProductListResponse> {
    return this.api
      .get(this.endpoints.products, {
        searchParams: {
          q: query.q || undefined,
          category: query.category === 'all' ? undefined : query.category,
          sort: query.sort,
          page: query.page,
          pageSize: query.pageSize,
        },
      })
      .json<ProductListResponse>()
  }
}
