import { describe, expect, it } from 'vitest'

import { findLayerViolations } from './check-layer-boundaries.mjs'

describe('findLayerViolations', () => {
  it.each([
    [
      'src/entities/product/model/Product.ts',
      "import { Button } from '@/features/cart/ui/Button'",
    ],
    [
      'src/shared/ui/Button.ts',
      "export { Header } from '@/widgets/header/ui/Header'",
    ],
    [
      'src/entities/product/model/Product.ts',
      "const module = import('../../../features/cart/ui/Button')",
    ],
    [
      'src/features/cart/model/Cart.ts',
      "import type { Page } from '@/views/cart/model/Page'",
    ],
  ])('findLayerViolations: upward edge from %s -> fails', (file, source) => {
    expect(findLayerViolations(file, source)).toHaveLength(1)
  })

  it.each([
    [
      'src/views/products/ui/Page.ts',
      "import { Product } from '@/entities/product/model/Product'",
    ],
    [
      'src/entities/product/model/Product.ts',
      "import type { Price } from './Price'",
    ],
    ['src/shared/ui/Button.ts', "import { useState } from 'react'"],
    [
      'src/analytics/logger.ts',
      "import type { Product } from '@/entities/product/model/Product'",
    ],
    [
      'src/shared/ui/Button.ts',
      'const text = "import x from \'@/features/cart\'"',
    ],
  ])(
    'findLayerViolations: allowed or non-import edge from %s -> passes',
    (file, source) => {
      expect(findLayerViolations(file, source)).toEqual([])
    },
  )
})
