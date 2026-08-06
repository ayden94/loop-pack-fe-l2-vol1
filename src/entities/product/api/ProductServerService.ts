import { queryOptions } from '@tanstack/react-query'

import { ProductServerRepository } from '@/entities/product/api/ProductServerRepository'
import {
  type ProductListRequest,
  ProductListRequestModel,
} from '@/entities/product/model/ProductListRequest'
import type { AppOrigin } from '@/shared/config/AppOrigin'

export class ProductServerService {
  constructor(
    private readonly repository: ProductServerRepository = new ProductServerRepository(),
  ) {}

  getProductList(request: ProductListRequest, origin: AppOrigin) {
    return queryOptions({
      queryKey: ProductListRequestModel.queryKey(request),
      queryFn: () => this.repository.getProductList(request, origin),
      staleTime: 30_000,
    })
  }
}
