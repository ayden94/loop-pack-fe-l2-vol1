import { ProductService } from './api/service'

export {
  categorySchema,
  pageSchema,
  querySchema,
  sortSchema,
} from './model/product-query-schema'

export const productEntity = new ProductService()
