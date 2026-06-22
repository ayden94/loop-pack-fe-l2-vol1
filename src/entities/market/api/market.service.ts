import { Address, CartItem, Coupon, Member, PastOrder } from '../model'
import { MarketRepository } from './market.repository'

export type MarketSnapshot = {
  cartItems: Array<CartItem>
  coupons: Array<Coupon>
  addresses: Array<Address>
  member: Member
  pastOrders: Array<PastOrder>
}

export const MarketService = {
  getMarketSnapshot(): MarketSnapshot {
    const snapshot = MarketRepository.getMarketSnapshot()

    return {
      cartItems: snapshot.cartItems.map((item) => new CartItem(item)),
      coupons: snapshot.coupons.map((coupon) => new Coupon(coupon)),
      addresses: snapshot.addresses.map((address) => new Address(address)),
      member: new Member(snapshot.member),
      pastOrders: snapshot.pastOrders.map((order) => new PastOrder(order)),
    }
  },
}
