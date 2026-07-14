'use client'

import {
  type inferParserType,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from 'nuqs'

import { categorySchema, sortSchema } from '@/entities/product'

const categoryParser = parseAsStringEnum(categorySchema.options).withDefault(
  'all',
)
const sortParser = parseAsStringEnum(sortSchema.options).withDefault('latest')

const parsers = {
  q: parseAsString.withDefault(''),
  category: categoryParser,
  sort: sortParser,
  page: parseAsInteger.withDefault(1),
} as const

type ProductFilters = inferParserType<typeof parsers>

export function useProductFilters() {
  const [filters, setFilters] = useQueryStates(parsers, { history: 'push' })

  const updateFilter = (
    patch: Partial<Pick<ProductFilters, 'q' | 'category' | 'sort'>>,
  ) => {
    void setFilters({
      ...patch,
      page: 1,
    })
  }

  const updatePage = (page: number) => {
    void setFilters({ page })
  }

  return {
    filters,
    updateFilter,
    updatePage,
  }
}
