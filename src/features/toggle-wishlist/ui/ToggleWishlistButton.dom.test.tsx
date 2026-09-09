import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import {
  initAnalytics,
  registerProviders,
  resetAnalyticsForTest,
} from '@/analytics/logger'
import { useWishlistStore } from '@/entities/wishlist/model/WishlistStore'

import { ToggleWishlistButton } from './ToggleWishlistButton'

const track = vi.fn()

beforeEach(async () => {
  resetAnalyticsForTest()
  track.mockReset()
  useWishlistStore.getState().clearWishlist()
  registerProviders([
    {
      name: 'capture',
      initialize() {},
      track,
      identify() {},
      reset() {},
    },
  ])
  await initAnalytics()
})

afterEach(() => {
  resetAnalyticsForTest()
})

it('ToggleWishlistButton: add then remove -> records each resulting membership', async () => {
  const user = userEvent.setup()
  render(<ToggleWishlistButton productId="p1" productName="테스트 상품" />)
  const button = screen.getByRole('button', {
    name: '테스트 상품 위시리스트',
  })

  await user.click(button)
  await user.click(button)

  expect(track.mock.calls).toEqual([
    ['wishlist_toggle', { productId: 'p1', isInWishlist: true }],
    ['wishlist_toggle', { productId: 'p1', isInWishlist: false }],
  ])
  expect(button).toHaveAttribute('aria-pressed', 'false')
})
