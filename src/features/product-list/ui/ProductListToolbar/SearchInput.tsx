import type { ChangeEventHandler } from 'react'

type SearchInputProps = {
  readonly onSearchChange: ChangeEventHandler<HTMLInputElement>
  readonly searchQuery: string
}

export function SearchInput({ onSearchChange, searchQuery }: SearchInputProps) {
  return (
    <input
      aria-label="상품 검색"
      type="search"
      placeholder="상품 검색..."
      value={searchQuery}
      onChange={onSearchChange}
      className="flex-1 rounded-md border border-[#ddd] px-3.5 py-2.5 text-sm"
    />
  )
}
