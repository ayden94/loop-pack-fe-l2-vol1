'use client'

import { ControlledDialogDemo } from './dialog-demos/ControlledDialogDemo'
import { sectionClassName } from './dialog-demos/styles'
import { Task10ImperativeFixture } from './dialog-demos/Task10ImperativeFixture'
import { UncontrolledDialogDemo } from './dialog-demos/UncontrolledDialogDemo'

export function DialogDemos() {
  return (
    <section className={sectionClassName}>
      <div className="mb-4">
        <h2 className="text-base font-bold text-[var(--color-ink)]">
          Dialog 예시
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
          같은 Compound API로 비제어, 제어, 닫기 방지와 중첩 상태를 확인합니다.
        </p>
      </div>
      <div className="grid gap-4">
        <UncontrolledDialogDemo />
        <ControlledDialogDemo />
        <Task10ImperativeFixture />
      </div>
    </section>
  )
}
