import { useRef, useState } from 'react'

import { Dialog, type DialogHandle } from '@/shared/ui/dialog'

import { panelClassName, secondaryButtonClassName } from './styles'

export function Task10ImperativeFixture() {
  const dialogRef = useRef<DialogHandle | null>(null)
  const [callbackCount, setCallbackCount] = useState(0)
  const [handleKeys, setHandleKeys] = useState('not inspected')
  const [lastRequest, setLastRequest] = useState('none')

  function handleOpenChange(nextOpen: boolean) {
    setCallbackCount((currentCount) => currentCount + 1)
    setLastRequest(nextOpen ? 'open' : 'closed')
  }

  function handleInspect() {
    setHandleKeys(
      Object.keys(dialogRef.current ?? {})
        .toSorted()
        .join(','),
    )
  }

  function handleRefOpen() {
    dialogRef.current?.open()
  }

  function handleRefClose() {
    dialogRef.current?.close()
  }

  function handleRefToggle() {
    dialogRef.current?.toggle()
  }

  return (
    <article className={panelClassName} data-testid="dialog-task-10-fixture">
      <h3 className="text-sm font-bold text-[var(--color-ink)]">
        Task 10 임시 거절 fixture
      </h3>
      <div className="mt-4 grid gap-1 text-sm text-[var(--color-text)]">
        <div data-testid="dialog-task-10-fixture-keys">keys: {handleKeys}</div>
        <div data-testid="dialog-task-10-fixture-count">
          callback count: {callbackCount}
        </div>
        <div data-testid="dialog-task-10-fixture-request">
          last request: {lastRequest}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className={secondaryButtonClassName}
          data-testid="dialog-task-10-fixture-inspect"
          type="button"
          onClick={handleInspect}
        >
          handle key 검사
        </button>
        <button
          className={secondaryButtonClassName}
          data-testid="dialog-task-10-fixture-open"
          type="button"
          onClick={handleRefOpen}
        >
          ref.open() 요청
        </button>
        <button
          className={secondaryButtonClassName}
          data-testid="dialog-task-10-fixture-close"
          type="button"
          onClick={handleRefClose}
        >
          ref.close() 요청
        </button>
        <button
          className={secondaryButtonClassName}
          data-testid="dialog-task-10-fixture-toggle"
          type="button"
          onClick={handleRefToggle}
        >
          ref.toggle() 요청
        </button>
      </div>
      <Dialog ref={dialogRef} open={false} onOpenChange={handleOpenChange}>
        <Dialog.Content data-testid="dialog-task-10-fixture-content">
          거절 fixture는 열리면 안 됩니다.
        </Dialog.Content>
      </Dialog>
    </article>
  )
}
