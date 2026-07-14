import { ProductService } from './api/ProductService'

export {
  categorySchema,
  pageSchema,
  querySchema,
  sortSchema,
} from './model/ProductQuerySchema'

export const productEntity = new ProductService()
