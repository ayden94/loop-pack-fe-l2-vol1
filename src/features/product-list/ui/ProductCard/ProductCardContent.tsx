import type { Product } from '@/entities/product'

import { ProductCardMeta } from './ProductCardMeta'
import { ProductCardPrice } from './ProductCardPrice'
import { ProductCardTitle } from './ProductCardTitle'

type ProductCardContentProps = {
  readonly isWished: boolean
  readonly onWishlistToggle: (productId: Product['id']) => void
  readonly product: Product
  readonly searchQuery: string
}

export function ProductCardContent({
  isWished,
  onWishlistToggle,
  product,
  searchQuery,
}: ProductCardContentProps) {
  return (
    <div className="p-3">
      <ProductCardTitle searchQuery={searchQuery} title={product.name} />
      <ProductCardPrice product={product} />
      <ProductCardMeta
        isWished={isWished}
        product={product}
        onWishlistToggle={onWishlistToggle}
      />
    </div>
  )
}
