import type { Product } from '@/entities/product'

export type ProductCardProps = {
  readonly isWished: boolean
  readonly onProductClick: (productId: Product['id']) => void
  readonly onWishlistToggle: (productId: Product['id']) => void
  readonly product: Product
  readonly searchQuery: string
}
