import type { ChangeEventHandler } from 'react'

import type { ProductListSortBy, ProductListViewMode } from '../../model'
import { SearchInput } from './SearchInput'
import { SortSelect } from './SortSelect'
import { ViewModeSelect } from './ViewModeSelect'

type ProductListToolbarProps = {
  readonly onSearchChange: ChangeEventHandler<HTMLInputElement>
  readonly onSortChange: ChangeEventHandler<HTMLSelectElement>
  readonly onViewModeChange: ChangeEventHandler<HTMLSelectElement>
  readonly searchQuery: string
  readonly sortBy: ProductListSortBy
  readonly viewMode: ProductListViewMode
}

export function ProductListToolbar({
  onSearchChange,
  onSortChange,
  onViewModeChange,
  searchQuery,
  sortBy,
  viewMode,
}: ProductListToolbarProps) {
  return (
    <section className="mb-6 flex gap-3">
      <SearchInput searchQuery={searchQuery} onSearchChange={onSearchChange} />
      <SortSelect sortBy={sortBy} onSortChange={onSortChange} />
      <ViewModeSelect viewMode={viewMode} onViewModeChange={onViewModeChange} />
    </section>
  )
}
