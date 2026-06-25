import type { Coupon } from '@/entities/market'
import { ApplyCouponForm } from '@/features/market'
import { Heading, SectionCard } from '@/shared/ui'

export function CouponCodeSection({
  coupons,
  appliedCoupon,
  onAppliedCoupon,
}: {
  coupons: Array<Coupon>
  appliedCoupon: Coupon | null
  onAppliedCoupon: (coupon: Coupon | null) => void
}) {
  return (
    <SectionCard>
      <Heading.H2>쿠폰</Heading.H2>
      <ApplyCouponForm
        coupons={coupons}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={onAppliedCoupon}
      />
    </SectionCard>
  )
}
