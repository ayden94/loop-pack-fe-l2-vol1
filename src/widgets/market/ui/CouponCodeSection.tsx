import { Show } from '@ilokesto/utilinent'
import { useState } from 'react'

import { type Coupon, marketService, OrderLine } from '@/entities/market'
import { Button, Heading, Input, SectionCard } from '@/shared/ui'

export function CouponCodeSection({
  onAppliedCoupon,
}: {
  onAppliedCoupon: (coupon: Coupon | null) => void
}) {
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const coupons = marketService.getCoupons()

  const applyCoupon = () => {
    const found = coupons.find((coupon) => coupon.code === couponCode.trim())
    setAppliedCoupon(found ?? null)
    onAppliedCoupon(found ?? null)
    if (!found) alert('존재하지 않는 쿠폰이에요')
  }

  return (
    <SectionCard>
      <Heading.H2>쿠폰</Heading.H2>
      <div className="flex gap-2">
        <Input
          aria-label="쿠폰 코드"
          type="text"
          value={couponCode}
          onChange={(e) => {
            setCouponCode(e.target.value)
          }}
          placeholder="쿠폰 코드 (예: WELCOME5000)"
        />
        <Button type="button" onClick={applyCoupon}>
          적용
        </Button>
      </div>
      <Show when={appliedCoupon}>
        {(coupon) => (
          <OrderLine.Description>{coupon.label} 적용됨</OrderLine.Description>
        )}
      </Show>
    </SectionCard>
  )
}
