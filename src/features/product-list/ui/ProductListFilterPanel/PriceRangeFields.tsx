import type { ChangeEventHandler } from 'react'

import type { ProductListPriceFilter } from '../../model'

type PriceRangeFieldsProps = {
  readonly maxPrice: ProductListPriceFilter
  readonly minPrice: ProductListPriceFilter
  readonly onMaxPriceChange: ChangeEventHandler<HTMLInputElement>
  readonly onMinPriceChange: ChangeEventHandler<HTMLInputElement>
}

const filterLabelClassName = 'text-[13px] font-semibold text-[#444]'
const priceInputClassName =
  'w-[100px] rounded-md border border-[#ddd] px-2.5 py-1.5 text-[13px]'

export function PriceRangeFields({
  maxPrice,
  minPrice,
  onMaxPriceChange,
  onMinPriceChange,
}: PriceRangeFieldsProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className={filterLabelClassName}>가격 범위</span>
      <div className="flex items-center gap-2">
        <input
          aria-label="최소 가격"
          type="number"
          placeholder="최소"
          value={minPrice}
          onChange={onMinPriceChange}
          min={0}
          className={priceInputClassName}
        />
        <span>~</span>
        <input
          aria-label="최대 가격"
          type="number"
          placeholder="최대"
          value={maxPrice}
          onChange={onMaxPriceChange}
          min={0}
          className={priceInputClassName}
        />
      </div>
    </div>
  )
}
