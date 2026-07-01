import {
  InvalidProductListDataError,
  InvalidProductListResponseError,
  InvalidProductTotalCountError,
} from '../errors'
import type { Product, ProductCategory } from '../types'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const isProductCategory = (value: unknown): value is ProductCategory =>
  value === 'electronics' ||
  value === 'fashion' ||
  value === 'home' ||
  value === 'beauty'

const isProduct = (value: unknown): value is Product => {
  if (!isRecord(value)) {
    return false
  }

  return (
    isFiniteNumber(value.id) &&
    typeof value.name === 'string' &&
    isProductCategory(value.category) &&
    isFiniteNumber(value.price) &&
    (value.originalPrice === undefined ||
      isFiniteNumber(value.originalPrice)) &&
    isFiniteNumber(value.stock) &&
    typeof value.imageUrl === 'string' &&
    typeof value.createdAt === 'string' &&
    isFiniteNumber(value.rating) &&
    isFiniteNumber(value.reviewCount)
  )
}

export class ProductList {
  products: Array<Product>
  totalCount: number

  constructor(value: unknown) {
    if (!isRecord(value)) {
      throw new InvalidProductListResponseError()
    }

    if (!Array.isArray(value.products) || !value.products.every(isProduct)) {
      throw new InvalidProductListDataError()
    }

    if (!isFiniteNumber(value.totalCount)) {
      throw new InvalidProductTotalCountError()
    }

    this.products = value.products
    this.totalCount = value.totalCount
  }
}
