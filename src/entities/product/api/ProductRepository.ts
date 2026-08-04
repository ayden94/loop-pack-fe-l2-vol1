import type { DiagnosticScenario } from '@/entities/product/model/DiagnosticScenario'
import {
  homeResponseSchema,
  productListResponseSchema,
} from '@/entities/product/model/ResponseSchema'
import type {
  HomeResponse,
  ProductListQuery,
  ProductListResponse,
} from '@/entities/product/model/types'
import { apiClient } from '@/shared/api/ApiClient'

export class ProductRepository {
  constructor(private readonly api: typeof apiClient = apiClient) {}

  readonly endpoints = {
    home: 'api/home',
    products: 'api/products',
  } as const

  async getHome(diagnosticScenario: DiagnosticScenario): Promise<HomeResponse> {
    const json = await this.api
      .get(this.endpoints.home, {
        searchParams: { scenario: diagnosticScenario.scenario },
      })
      .json<unknown>()
    return homeResponseSchema.parse(json)
  }

  async getProductList(
    query: ProductListQuery,
    diagnosticScenario: DiagnosticScenario,
  ): Promise<ProductListResponse> {
    const json = await this.api
      .get(this.endpoints.products, {
        searchParams: {
          q: query.q || undefined,
          category: query.category === 'all' ? undefined : query.category,
          sort: query.sort,
          page: query.page,
          pageSize: query.pageSize,
          scenario: diagnosticScenario.scenario,
        },
      })
      .json<unknown>()
    return productListResponseSchema.parse(json)
  }
}
