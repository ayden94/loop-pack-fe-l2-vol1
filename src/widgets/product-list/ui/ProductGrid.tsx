import { For } from '@ilokesto/utilinent'
import { cn } from 'tailwind-variants'

import { type Product, ProductCard } from '@/entities/product'
import {
  type ProductListViewMode,
  WishlistToggleButton,
} from '@/features/product-list'

type ProductGridProps = {
  readonly onProductClick: (productId: Product['id']) => void
  readonly onWishlistToggle: (productId: Product['id']) => void
  readonly products: Array<Product>
  readonly searchQuery: string
  readonly viewMode: ProductListViewMode
  readonly wishlist: ReadonlyArray<Product['id']>
}

export function ProductGrid({
  onProductClick,
  onWishlistToggle,
  products,
  searchQuery,
  viewMode,
  wishlist,
}: ProductGridProps) {
  return (
    <For.section
      each={products}
      fallback={
        <div className="col-span-full py-15 text-center text-[#888]">
          조건에 맞는 상품이 없습니다.
        </div>
      }
      className={cn(
        'mb-8 grid gap-5',
        viewMode === 'list'
          ? 'grid-cols-1'
          : 'grid-cols-[repeat(auto-fill,minmax(220px,1fr))]',
      )}
    >
      {(product) => {
        const isWished = wishlist.includes(product.id)

        return (
          <ProductCard
            key={product.id}
            action={
              <WishlistToggleButton
                isWished={isWished}
                productId={product.id}
                productName={product.name}
                onToggle={onWishlistToggle}
              />
            }
            clickAriaLabel={`${product.name} 최근 본 상품에 추가`}
            highlightQuery={searchQuery}
            product={product}
            onClick={onProductClick}
          />
        )
      }}
    </For.section>
  )
}
