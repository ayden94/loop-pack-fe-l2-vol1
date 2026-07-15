'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

import { productEntity } from '@/entities/product/api/ProductService'
import type { Category, Product } from '@/types/commerce'
import { ProductCard } from '@/widgets/product-card/ui/ProductCard'

function CategoryLinks({ categories }: { categories: Array<Category> }) {
  return (
    <nav aria-label="카테고리" className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/products?category=${category.id}`}
          className="rounded border border-(--color-border) px-3 py-2 text-sm text-(--color-text) hover:bg-(--color-surface-muted)"
        >
          {category.name}
        </Link>
      ))}
    </nav>
  )
}

function ProductGrid({
  title,
  products,
}: {
  title: string
  products: Array<Product>
}) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-lg font-bold text-(--color-ink)">{title}</h2>
      {products.length === 0 ? (
        <p className="py-10 text-center text-(--color-muted)">
          표시할 상품이 없습니다.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}

export function HomeView() {
  const { data, isPending, isError, error } = useQuery(productEntity.getHome())

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      {isPending ? (
        <div className="py-20 text-center text-(--color-muted)">
          홈 데이터를 불러오는 중…
        </div>
      ) : isError ? (
        <div className="py-20 text-center text-(--color-muted)">
          {error instanceof Error
            ? error.message
            : '홈 데이터를 불러오지 못했습니다.'}
        </div>
      ) : (
        <>
          <section className="flex min-h-56 flex-col justify-end gap-2 rounded-lg bg-(--color-surface-soft) p-8">
            <p className="text-sm text-(--color-muted)">
              {data.banner.description}
            </p>
            <h1 className="text-2xl font-extrabold text-(--color-ink)">
              {data.banner.title}
            </h1>
          </section>

          <section className="mt-10">
            <h2 className="mb-4 text-lg font-bold text-(--color-ink)">
              카테고리
            </h2>
            <CategoryLinks categories={data.categories} />
          </section>

          <ProductGrid title="인기 상품" products={data.popularProducts} />
          <ProductGrid title="신상품" products={data.newProducts} />
        </>
      )}
    </main>
  )
}
