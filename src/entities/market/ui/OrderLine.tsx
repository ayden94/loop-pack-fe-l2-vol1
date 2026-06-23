import type { ReactNode } from 'react'

type OrderLineSlotProps = {
  children: ReactNode
}

type OrderLineAmountProps = {
  amount: number
}

function OrderLineRoot({ children }: OrderLineSlotProps) {
  return <div className="flex items-center gap-2.5 py-2">{children}</div>
}

function OrderLineThumbnail({ children }: OrderLineSlotProps) {
  return <span className="text-[26px]">{children}</span>
}

function OrderLineContent({ children }: OrderLineSlotProps) {
  return <div className="min-w-0 flex-1">{children}</div>
}

function OrderLineTitle({ children }: OrderLineSlotProps) {
  return <span className="text-(--text)">{children}</span>
}

function OrderLineDescription({ children }: OrderLineSlotProps) {
  return (
    <small className="mt-0.5 block text-[13px] text-(--text) opacity-70">
      {children}
    </small>
  )
}

function OrderLineAmount({ amount }: OrderLineAmountProps) {
  return (
    <strong className="whitespace-nowrap text-(--text-h)">
      {amount.toLocaleString()}원
    </strong>
  )
}

function OrderLineDiscountAmount({ amount }: OrderLineAmountProps) {
  return (
    <strong className="whitespace-nowrap text-[#ef4444]">
      - {amount.toLocaleString()}원
    </strong>
  )
}

export const OrderLine = {
  Root: OrderLineRoot,
  Thumbnail: OrderLineThumbnail,
  Content: OrderLineContent,
  Title: OrderLineTitle,
  Description: OrderLineDescription,
  Amount: OrderLineAmount,
  DiscountAmount: OrderLineDiscountAmount,
}
