import type { UseAsyncSelectOptions } from '@/shared/lib'

import { ProductList, type ProductListResponse } from '../model'
import { ProductRepository } from './ProductRepository'

type ProductListOptionsParams = {
  readonly apiQueryString: string
  readonly inStockOnly: boolean
}

export class ProductService {
  constructor(private readonly repository = new ProductRepository()) {}

  getProductListOptions({
    apiQueryString,
    inStockOnly,
  }: ProductListOptionsParams): UseAsyncSelectOptions<
    unknown,
    ProductListResponse
  > {
    return {
      asyncFn: async () => {
        return this.repository.getProductList(apiQueryString)
      },
      deps: [apiQueryString],
      keepPreviousData: true,
      selectFn: (data: unknown): ProductListResponse => {
        const parsedData = new ProductList(data)

        return {
          products: inStockOnly
            ? parsedData.products.filter((product) => product.stock > 0)
            : parsedData.products,
          totalCount: parsedData.totalCount,
        }
      },
      selectDeps: [inStockOnly],
    }
  }
}
