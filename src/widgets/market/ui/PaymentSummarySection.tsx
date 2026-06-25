import { Show } from '@ilokesto/utilinent'

import type { Coupon } from '@/entities/market'
import { OrderLineRow } from '@/features/market'
import { Heading, Price, SectionCard } from '@/shared/ui'

type PaymentSummarySectionProps = {
  itemTotal: number
  shippingFee: number
  couponDiscount: number
  pointDiscount: number
  memberDisplayPrice: number
  appliedCoupon: Coupon | null
}

export function PaymentSummarySection({
  itemTotal,
  shippingFee,
  couponDiscount,
  pointDiscount,
  memberDisplayPrice,
  appliedCoupon,
}: PaymentSummarySectionProps) {
  return (
    <SectionCard>
      <Heading.H2>결제 금액</Heading.H2>

      <OrderLineRow kind="amount" label="상품 금액" amount={itemTotal} />
      <OrderLineRow kind="amount" label="배송비" amount={shippingFee} />

      <Show when={appliedCoupon}>
        {(coupon) => (
          <OrderLineRow
            kind="coupon-discount"
            coupon={coupon}
            amount={couponDiscount}
          />
        )}
      </Show>

      <Show when={pointDiscount > 0}>
        <OrderLineRow kind="point-discount" amount={pointDiscount} />
      </Show>

      <div className="mt-2 flex items-center justify-between border-t border-(--border) pt-3 font-semibold text-(--text-h)">
        <span>최종 결제 금액</span>
        <Price value={memberDisplayPrice} />
      </div>
    </SectionCard>
  )
}
