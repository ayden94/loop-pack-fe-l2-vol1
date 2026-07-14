'use client'

import Image from 'next/image'

import { cartSelectors, useCartStore } from '@/features/cart/model/CartStore'
import {
  useWishlistStore,
  wishlistSelectors,
} from '@/features/wishlist/model/WishlistStore'
import type { Product } from '@/types/commerce'

type ProductCardProps = {
  product: Product
  priority?: boolean
}

const formatPrice = (price: number) => `${price.toLocaleString('ko-KR')}원`

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const isInCart = useCartStore(cartSelectors.isInCart(product.id))
  const isInWishlist = useWishlistStore(
    wishlistSelectors.isInWishlist(product.id),
  )
  const { addToCart, removeFromCart } = useCartStore()
  const { toggleWishlist } = useWishlistStore()

  const discountRate =
    product.originalPrice !== null
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : null

  return (
    <article className="flex flex-col gap-2">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-(--color-surface-soft)">
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority={priority}
          sizes="(max-width: 480px) 50vw, (max-width: 960px) 33vw, 20vw"
          className="object-cover"
        />
      </div>
      <p className="text-xs text-(--color-subtle)">{product.brand}</p>
      <h3 className="line-clamp-2 text-sm leading-snug text-(--color-text)">
        {product.name}
      </h3>
      <div className="flex items-baseline gap-2">
        <strong className="text-base font-bold text-(--color-ink)">
          {formatPrice(product.price)}
        </strong>
        {product.originalPrice !== null && discountRate !== null && (
          <>
            <span className="text-xs text-(--color-subtle) line-through">
              {formatPrice(product.originalPrice)}
            </span>
            <span className="text-xs font-semibold text-red-500">
              {String(discountRate)}%
            </span>
          </>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          aria-pressed={isInWishlist}
          aria-label={`${product.name} 위시리스트`}
          onClick={() => {
            toggleWishlist(product.id)
          }}
          className="flex-1 rounded border border-(--color-border) px-3 py-2 text-xs text-(--color-text) hover:bg-(--color-surface-muted)"
        >
          {isInWishlist ? '찜 해제' : '찜'}
        </button>
        <button
          type="button"
          aria-pressed={isInCart}
          aria-label={`${product.name} 장바구니`}
          onClick={() => {
            if (isInCart) {
              removeFromCart(product.id)
            } else {
              addToCart(product.id)
            }
          }}
          className="flex-1 rounded border border-(--color-border) px-3 py-2 text-xs text-(--color-text) hover:bg-(--color-surface-muted)"
        >
          {isInCart ? '빼기' : '담기'}
        </button>
      </div>
    </article>
  )
}
