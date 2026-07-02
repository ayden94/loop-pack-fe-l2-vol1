import type { ChangeEvent, ComponentProps } from 'react'
import { useEffect, useRef, useState } from 'react'

const DEBOUNCED_INPUT_DELAY_MS = 400

type DebouncedInputProps = Omit<
  ComponentProps<'input'>,
  'defaultValue' | 'onChange' | 'value'
> & {
  readonly onValueChange: (value: string) => void
  readonly syncKey?: number | string
  readonly value: string
}

export function DebouncedInput({
  onValueChange,
  syncKey = 0,
  value,
  ...inputProps
}: DebouncedInputProps) {
  return (
    <DebouncedInputControl
      key={`${String(syncKey)}:${value}`}
      initialValue={value}
      onValueChange={onValueChange}
      {...inputProps}
    />
  )
}

type DebouncedInputControlProps = Omit<
  DebouncedInputProps,
  'syncKey' | 'value'
> & {
  readonly initialValue: string
}

function DebouncedInputControl({
  initialValue,
  onValueChange,
  ...inputProps
}: DebouncedInputControlProps) {
  const [inputValue, setInputValue] = useState(initialValue)
  const debounceTimeoutIdRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => {
      const debounceTimeoutId = debounceTimeoutIdRef.current

      if (debounceTimeoutId !== undefined) {
        window.clearTimeout(debounceTimeoutId)
      }
    }
  }, [])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value
    setInputValue(nextValue)

    const debounceTimeoutId = debounceTimeoutIdRef.current
    if (debounceTimeoutId !== undefined) {
      window.clearTimeout(debounceTimeoutId)
    }

    debounceTimeoutIdRef.current = window.setTimeout(() => {
      debounceTimeoutIdRef.current = undefined
      onValueChange(nextValue)
    }, DEBOUNCED_INPUT_DELAY_MS)
  }

  return <input {...inputProps} value={inputValue} onChange={handleChange} />
}
