import {
  type ProductListRequest,
  ProductListRequestModel,
} from '@/entities/product/model/ProductListRequest'
import { productListResponseSchema } from '@/entities/product/model/ResponseSchema'
import type { ProductListResponse } from '@/entities/product/model/types'
import {
  API_ERROR_FALLBACK_MESSAGE,
  ApiClientError,
} from '@/shared/api/ApiClientError'
import { ApiErrorResponseSchema } from '@/shared/api/ApiErrorResponse'
import type { AppOrigin } from '@/shared/config/AppOrigin'

export class ProductServerRepository {
  constructor(
    private readonly fetch: typeof globalThis.fetch = globalThis.fetch,
  ) {}

  async getProductList(
    request: ProductListRequest,
    origin: AppOrigin,
  ): Promise<ProductListResponse> {
    const descriptor = ProductListRequestModel.serverDescriptor(request, origin)
    const response = await this.fetch(descriptor.input, descriptor.init)

    if (!response.ok) {
      const text = await response.text()
      let body: unknown
      try {
        body = text === '' ? undefined : JSON.parse(text)
      } catch (error) {
        if (!(error instanceof SyntaxError)) {
          throw error
        }
        body = undefined
      }
      const result = ApiErrorResponseSchema.safeParse(body)
      throw new ApiClientError(
        result.success ? result.data.message : API_ERROR_FALLBACK_MESSAGE,
        response.status,
      )
    }

    const body: unknown = await response.json()
    return productListResponseSchema.parse(body)
  }
}
