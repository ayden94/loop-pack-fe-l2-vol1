import { create } from 'zustand'
import { pipe } from 'zustand-middleware-pipe'
import { devtools } from 'zustand-middleware-pipe/middleware'

type CartState = {
  items: Partial<Record<string, true>>
}

type CartActions = {
  addToCart: (productId: string) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
}

type CartStore = CartState & CartActions

const initialCartState: CartState = {
  items: {},
}

export const useCartStore = create<CartStore>()(
  pipe.use(devtools({ name: 'CartStore' })).create((set) => ({
    ...initialCartState,
    addToCart: (productId) => {
      set(
        (state) => ({ items: { ...state.items, [productId]: true } }),
        false,
        'addToCart',
      )
    },
    removeFromCart: (productId) => {
      set(
        (state) => {
          const { [productId]: _removed, ...rest } = state.items
          return { items: rest }
        },
        false,
        'removeFromCart',
      )
    },
    clearCart: () => {
      set(() => initialCartState, false, 'clearCart')
    },
  })),
)

export const cartSelectors = {
  count: (state: CartStore) => Object.keys(state.items).length,
  isInCart: (productId: string) => (state: CartStore) =>
    state.items[productId] === true,
} as const
