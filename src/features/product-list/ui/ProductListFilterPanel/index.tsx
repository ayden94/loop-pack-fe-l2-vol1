import type { ChangeEventHandler } from 'react'

import type {
  ProductListCategoryFilter,
  ProductListPriceFilter,
} from '../../model'
import { CategoryFilters } from './CategoryFilters'
import { InStockToggle } from './InStockToggle'
import { PriceRangeFields } from './PriceRangeFields'
import { ResetFiltersButton } from './ResetFiltersButton'

type ProductListFilterPanelProps = {
  readonly category: ProductListCategoryFilter
  readonly inStockOnly: boolean
  readonly maxPrice: ProductListPriceFilter
  readonly minPrice: ProductListPriceFilter
  readonly onCategoryChange: (category: ProductListCategoryFilter) => void
  readonly onInStockToggle: ChangeEventHandler<HTMLInputElement>
  readonly onMaxPriceChange: ChangeEventHandler<HTMLInputElement>
  readonly onMinPriceChange: ChangeEventHandler<HTMLInputElement>
  readonly onResetFilters: () => void
}

export function ProductListFilterPanel({
  category,
  inStockOnly,
  maxPrice,
  minPrice,
  onCategoryChange,
  onInStockToggle,
  onMaxPriceChange,
  onMinPriceChange,
  onResetFilters,
}: ProductListFilterPanelProps) {
  return (
    <section className="mb-4 flex flex-wrap items-end gap-6 rounded-lg bg-[#f7f7f8] p-4">
      <CategoryFilters
        category={category}
        onCategoryChange={onCategoryChange}
      />
      <PriceRangeFields
        maxPrice={maxPrice}
        minPrice={minPrice}
        onMaxPriceChange={onMaxPriceChange}
        onMinPriceChange={onMinPriceChange}
      />
      <InStockToggle
        inStockOnly={inStockOnly}
        onInStockToggle={onInStockToggle}
      />
      <ResetFiltersButton onResetFilters={onResetFilters} />
    </section>
  )
}
