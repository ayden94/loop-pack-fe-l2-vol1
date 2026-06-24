import { NoDeliveryAddressConfiguredError } from '../errors'
import type { Address } from '../objects'

export function resolveDeliveryAddress(
  addresses: ReadonlyArray<Address>,
  selectedAddressId: string,
) {
  const selected =
    addresses.find((address) => address.id === selectedAddressId) ??
    addresses.at(0)

  if (!selected) {
    throw new NoDeliveryAddressConfiguredError()
  }

  return selected
}
