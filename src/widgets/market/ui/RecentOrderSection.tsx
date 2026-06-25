import { For } from '@ilokesto/utilinent'

import type { PastOrder } from '@/entities/market'
import { OrderLineRow } from '@/features/market'
import { Heading, SectionCard } from '@/shared/ui'

export function RecentOrderSection({ orders }: { orders: Array<PastOrder> }) {
  return (
    <SectionCard>
      <Heading.H2>최근 주문</Heading.H2>
      <For each={orders}>
        {(order) => (
          <OrderLineRow key={order.id} kind="past-order" order={order} />
        )}
      </For>
    </SectionCard>
  )
}
