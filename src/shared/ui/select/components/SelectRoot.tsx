import { SelectContext } from '../lib/SelectContext'
import { useSelectRootState } from '../lib/useSelectRootState'
import type { SelectOption, SelectRootProps } from '../types'

export function SelectRoot<TOption extends SelectOption>({
  children,
  options,
  value,
  onChange,
}: SelectRootProps<TOption>) {
  const contextValue = useSelectRootState({ options, value, onChange })

  return <SelectContext value={contextValue}>{children}</SelectContext>
}
