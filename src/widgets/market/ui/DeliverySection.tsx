import { Show } from '@ilokesto/utilinent'
import { useState } from 'react'

import { type Address, resolveDeliveryAddress } from '@/entities/market'
import { AddressForm, SelectedAddress } from '@/features/market'
import { Heading, SectionCard } from '@/shared/ui'

// 배송지 — 접기/펼치기와 선택 요약은 스스로 책임진다.
// 단, 실제 선택 동작(onSelectAddress)은 AddressForm → AddressField 로 통과시킨다.
export function DeliverySection({
  addresses,
  selectedAddressId,
  onSelectAddress,
}: {
  addresses: Array<Address>
  selectedAddressId: string
  onSelectAddress: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const selectedAddress = resolveDeliveryAddress(addresses, selectedAddressId)

  return (
    <SectionCard>
      <div className="flex items-center justify-between gap-2">
        <Heading.H2>배송지</Heading.H2>

        <Show.Button
          when={expanded}
          fallback="변경"
          type="button"
          variant="link"
          onClick={() => {
            setExpanded((v) => !v)
          }}
        >
          접기
        </Show.Button>
      </div>

      <Show
        when={expanded}
        fallback={<SelectedAddress selected={selectedAddress} />}
      >
        <AddressForm
          addresses={addresses}
          selectedAddressId={selectedAddressId}
          onSelectAddress={onSelectAddress}
        />
      </Show>
    </SectionCard>
  )
}
