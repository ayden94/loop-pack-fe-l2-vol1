import { Show } from '@ilokesto/utilinent'
import { useState } from 'react'

import { Checkbox, Heading, Input, Label, SectionCard } from '@/shared/ui'

export function PointSection({
  currentPoint,
  onPointInputChange,
}: {
  currentPoint: number
  onPointInputChange: (value: number) => void
}) {
  const [pointInput, setPointInput] = useState(0)
  const [usePoint, setUsePoint] = useState(false)

  const handlePointInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    setPointInput(value)
    onPointInputChange(value)
  }

  const handleUsePointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsePoint(e.target.checked)
    if (!e.target.checked) {
      setPointInput(0)
      onPointInputChange(0)
    }
  }

  return (
    <SectionCard>
      <Heading.H2>적립금</Heading.H2>
      <Label>
        <Checkbox checked={usePoint} onChange={handleUsePointChange} />
        적립금 사용 (보유 {currentPoint.toLocaleString()}P)
      </Label>
      <Show when={usePoint}>
        <Input
          aria-label="사용할 적립금"
          type="number"
          value={pointInput}
          onChange={handlePointInputChange}
        />
      </Show>
    </SectionCard>
  )
}
