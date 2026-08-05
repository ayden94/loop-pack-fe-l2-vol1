import { queryOptions } from '@tanstack/react-query'

import type { DiagnosticScenario } from '@/entities/product/model/DiagnosticScenario'
import type { ProductListQuery } from '@/entities/product/model/types'

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
      list(query: ProductListQuery, diagnosticScenario: DiagnosticScenario) {
        return [
          ...ProductService.queryKeyFactory.product.all(),
          'list',
          query,
          diagnosticScenario,
        ] as const
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

  getProductList(
    query: ProductListQuery,
    diagnosticScenario: DiagnosticScenario,
  ) {
    return queryOptions({
      queryKey: ProductService.queryKeyFactory.product.list(
        query,
        diagnosticScenario,
      ),
      queryFn: ({ signal }) =>
        this.repository.getProductList(query, diagnosticScenario, signal),
      staleTime: 30_000,
    })
  }

  getServerProductList(
    query: ProductListQuery,
    diagnosticScenario: DiagnosticScenario,
  ) {
    return queryOptions({
      queryKey: ProductService.queryKeyFactory.product.list(
        query,
        diagnosticScenario,
      ),
      queryFn: () => this.repository.getProductList(query, diagnosticScenario),
      staleTime: 30_000,
    })
  }
}

export const productEntity = new ProductService()
