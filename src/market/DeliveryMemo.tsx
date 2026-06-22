import { useState } from 'react'

import { Textarea } from '../shared/ui'

export function DeliveryMemo() {
  const [memo, setMemo] = useState('')
  return (
    <Textarea
      value={memo}
      onChange={(e) => {
        setMemo(e.target.value)
      }}
      placeholder="배송 시 요청사항 (예: 부재 시 문 앞에 두세요)"
    />
  )
}
