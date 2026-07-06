import { useSelectContext } from '../lib/SelectContext'
import type { SelectContentProps } from '../types'

export function SelectContent({
  children,
  ...contentProps
}: SelectContentProps) {
  const select = useSelectContext('Content')

  if (!select.open) {
    return null
  }

  return (
    <div {...contentProps} id={select.listboxId} role="listbox">
      {children}
    </div>
  )
}
