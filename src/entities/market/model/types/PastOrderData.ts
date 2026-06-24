import type { OrderStatus } from './OrderStatus'

export type PastOrderData = {
  id: string
  summary: string
  status: OrderStatus
  amount: number
}
