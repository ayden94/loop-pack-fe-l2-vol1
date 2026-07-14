import { create } from 'zustand'
import { pipe } from 'zustand-middleware-pipe'
import { devtools } from 'zustand-middleware-pipe/middleware'

type WishlistState = {
  items: Partial<Record<string, true>>
}

type WishlistActions = {
  toggleWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  clearWishlist: () => void
}

type WishlistStore = WishlistState & WishlistActions

const initialWishlistState: WishlistState = {
  items: {},
}

export const useWishlistStore = create<WishlistStore>()(
  pipe.use(devtools({ name: 'WishlistStore' })).create((set) => ({
    ...initialWishlistState,
    toggleWishlist: (productId) => {
      set(
        (state) => {
          if (state.items[productId] !== undefined) {
            const { [productId]: _removed, ...rest } = state.items
            return { items: rest }
          }
          return { items: { ...state.items, [productId]: true } }
        },
        false,
        'toggleWishlist',
      )
    },
    removeFromWishlist: (productId) => {
      set(
        (state) => {
          const { [productId]: _removed, ...rest } = state.items
          return { items: rest }
        },
        false,
        'removeFromWishlist',
      )
    },
    clearWishlist: () => {
      set(() => initialWishlistState, false, 'clearWishlist')
    },
  })),
)

export const wishlistSelectors = {
  count: (state: WishlistStore) => Object.keys(state.items).length,
  isInWishlist: (productId: string) => (state: WishlistStore) =>
    state.items[productId] === true,
} as const
