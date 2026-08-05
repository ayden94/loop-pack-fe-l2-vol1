'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { productEntity } from '@/entities/product/api/ProductService'
import {
  type DiagnosticScenario,
  parseDiagnosticScenario,
} from '@/entities/product/model/DiagnosticScenario'
import { DEFAULT_PAGE_SIZE } from '@/entities/product/model/ProductQuerySchema'
import { useProductFilters } from '@/features/product-filter/model/useProductFilters'
import { FilterBar } from '@/features/product-filter/ui/FilterBar'
import { useProductListState } from '@/views/product-list/model/useProductListState'
import { ProductListSection } from '@/widgets/product-list/ui/ProductListSection'

type ProductListViewProps = {
  readonly diagnosticScenario: DiagnosticScenario
}

export function ProductListView({ diagnosticScenario }: ProductListViewProps) {
  const searchParams = useSearchParams()
  const scenarioSearchParam = searchParams.get('scenario')
  const currentDiagnosticScenario =
    scenarioSearchParam === diagnosticScenario.scenario
      ? diagnosticScenario
      : parseDiagnosticScenario(scenarioSearchParam)
  const { filters, updateFilter, updatePage } = useProductFilters()
  const productListQueryInput = {
    ...filters,
    pageSize: DEFAULT_PAGE_SIZE,
  }
  const productListScope = JSON.stringify({
    query: productListQueryInput,
    diagnosticScenario: currentDiagnosticScenario,
  })

  const productListOptions = productEntity.getProductList(
    productListQueryInput,
    currentDiagnosticScenario,
  )
  const productListQuery = useQuery(productListOptions)
  const productListState = useProductListState(
    productListQuery,
    productListOptions.queryKey,
    productListScope,
  )

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-extrabold text-(--color-ink)">
        상품 목록
      </h1>

      <section className="mb-6">
        <FilterBar
          filters={filters}
          totalCount={productListState.displayedData?.totalCount ?? 0}
          pageSize={DEFAULT_PAGE_SIZE}
          updateFilter={updateFilter}
          updatePage={updatePage}
        />
      </section>

      <ProductListSection
        query={productListQuery}
        displayedData={productListState.displayedData}
        displayedDataKey={productListState.displayedDataKey}
        scope={productListScope}
      />

      <div className="mt-8">
        <Link
          href="/"
          className="text-sm text-(--color-text) hover:text-(--color-ink)"
        >
          ← 홈으로
        </Link>
      </div>
    </main>
  )
}
