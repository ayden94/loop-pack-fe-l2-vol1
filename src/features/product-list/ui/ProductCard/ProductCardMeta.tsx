import type { Product } from '@/entities/product'

import { WishlistToggleButton } from './WishlistToggleButton'

type ProductCardMetaProps = {
  readonly isWished: boolean
  readonly onWishlistToggle: (productId: Product['id']) => void
  readonly product: Product
}

export function ProductCardMeta({
  isWished,
  onWishlistToggle,
  product,
}: ProductCardMetaProps) {
  return (
    <div className="flex items-center gap-1 text-xs text-[#666]">
      <span className="font-semibold text-[#f9a825]">
        ★ {product.rating.toFixed(1)}
      </span>
      <span>({product.reviewCount.toLocaleString()})</span>

      <WishlistToggleButton
        isWished={isWished}
        productId={product.id}
        productName={product.name}
        onToggle={onWishlistToggle}
      />
    </div>
  )
}
