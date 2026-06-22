import type {
  AddressData,
  CartItemData,
  CouponData,
  MemberData,
  MemberGrade,
  OrderStatus,
  PastOrderData,
} from '../types'

export class CartItem {
  readonly id: string
  readonly name: string
  readonly option: string
  readonly price: number
  readonly quantity: number
  readonly thumbnail: string

  constructor(data: CartItemData) {
    this.id = data.id
    this.name = data.name
    this.option = data.option
    this.price = data.price
    this.quantity = data.quantity
    this.thumbnail = data.thumbnail
  }

  get totalPrice() {
    return this.price * this.quantity
  }
}

export class Coupon {
  readonly code: string
  readonly label: string
  readonly discount: number

  constructor(data: CouponData) {
    this.code = data.code
    this.label = data.label
    this.discount = data.discount
  }
}

export class Address {
  readonly id: string
  readonly label: string
  readonly recipient: string
  readonly detail: string
  readonly isRemote: boolean

  constructor(data: AddressData) {
    this.id = data.id
    this.label = data.label
    this.recipient = data.recipient
    this.detail = data.detail
    this.isRemote = data.isRemote
  }
}

export class Member {
  readonly name: string
  readonly grade: MemberGrade
  readonly point: number

  constructor(data: MemberData) {
    this.name = data.name
    this.grade = data.grade
    this.point = data.point
  }
}

export class PastOrder {
  readonly id: string
  readonly summary: string
  readonly status: OrderStatus
  readonly amount: number

  constructor(data: PastOrderData) {
    this.id = data.id
    this.summary = data.summary
    this.status = data.status
    this.amount = data.amount
  }
}
