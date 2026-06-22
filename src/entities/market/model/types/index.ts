export type PaymentMethod = 'card' | 'transfer' | 'kakao'

export type MemberGrade = 'VIP' | 'NORMAL'

export type OrderStatus =
  | 'paid'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type CartItemData = {
  id: string
  name: string
  option: string
  price: number
  quantity: number
  thumbnail: string
}

export type CouponData = {
  code: string
  label: string
  discount: number
}

export type AddressData = {
  id: string
  label: string
  recipient: string
  detail: string
  isRemote: boolean
}

export type MemberData = {
  name: string
  grade: MemberGrade
  point: number
}

export type PastOrderData = {
  id: string
  summary: string
  status: OrderStatus
  amount: number
}
