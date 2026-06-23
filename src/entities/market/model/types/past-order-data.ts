import type { OrderStatus } from './order-status'

export type PastOrderData = {
  id: string
  summary: string
  status: OrderStatus
  amount: number
}
