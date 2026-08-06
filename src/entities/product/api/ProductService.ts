import { queryOptions } from '@tanstack/react-query'

import type { DiagnosticScenario } from '@/entities/product/model/DiagnosticScenario'
import {
  type ProductListRequest,
  ProductListRequestModel,
} from '@/entities/product/model/ProductListRequest'

import { ProductRepository } from './ProductRepository'

export class ProductService {
  constructor(
    private readonly repository: ProductRepository = new ProductRepository(),
  ) {}

  static queryKeyFactory = {
    home: {
      all(diagnosticScenario: DiagnosticScenario) {
        return ['home', diagnosticScenario] as const
      },
    },
    product: {
      all() {
        return ['products'] as const
      },
      list(request: ProductListRequest) {
        return ProductListRequestModel.queryKey(request)
      },
    },
  }

  getHome(diagnosticScenario: DiagnosticScenario) {
    return queryOptions({
      queryKey: ProductService.queryKeyFactory.home.all(diagnosticScenario),
      queryFn: () => this.repository.getHome(diagnosticScenario),
      staleTime: 60_000,
    })
  }

  getProductList(request: ProductListRequest) {
    return queryOptions({
      queryKey: ProductService.queryKeyFactory.product.list(request),
      queryFn: ({ signal }) => this.repository.getProductList(request, signal),
      placeholderData: (previousData) => previousData,
      staleTime: 30_000,
      throwOnError: false,
    })
  }
}

export const productEntity = new ProductService()
