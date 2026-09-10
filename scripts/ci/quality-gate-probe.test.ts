import { expect, it } from 'vitest'

// 실험 브랜치에서만 required check의 실패 전파를 검증한다.
const probeValue = 'blocked'

it('qualityGateProbe: ready fixture -> required quality may pass', () => {
  expect(probeValue).toBe('ready')
})
