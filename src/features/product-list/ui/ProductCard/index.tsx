import { ProductCardContent } from './ProductCardContent'
import { ProductCardMedia } from './ProductCardMedia'
import type { ProductCardProps } from './types'

export function ProductCard({
  isWished,
  onProductClick,
  onWishlistToggle,
  product,
  searchQuery,
}: ProductCardProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-[#eee] bg-white transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]">
      <button
        type="button"
        className="absolute inset-0 z-10 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111]"
        onClick={() => {
          onProductClick(product.id)
        }}
        aria-label={`${product.name} 최근 본 상품에 추가`}
      />
      <ProductCardMedia product={product} />
      <ProductCardContent
        isWished={isWished}
        product={product}
        searchQuery={searchQuery}
        onWishlistToggle={onWishlistToggle}
      />
    </div>
  )
}
