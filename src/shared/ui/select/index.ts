'use client'

import { SelectContent } from './components/SelectContent'
import { SelectItem } from './components/SelectItem'
import { SelectRoot } from './components/SelectRoot'
import { SelectTrigger } from './components/SelectTrigger'
import { SelectValue } from './components/SelectValue'

export type { SelectOption } from './types'

export const Select = {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Content: SelectContent,
  Item: SelectItem,
} satisfies {
  readonly Root: typeof SelectRoot
  readonly Trigger: typeof SelectTrigger
  readonly Value: typeof SelectValue
  readonly Content: typeof SelectContent
  readonly Item: typeof SelectItem
}
