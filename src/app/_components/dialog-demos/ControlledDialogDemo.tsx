import { useRef, useState } from 'react'

import { Dialog, type DialogHandle } from '@/shared/ui/dialog'

import {
  closeClassName,
  contentClassName,
  overlayClassName,
  panelClassName,
  secondaryButtonClassName,
  triggerClassName,
} from './styles'

export function ControlledDialogDemo() {
  const dialogRef = useRef<DialogHandle | null>(null)
  const [open, setOpen] = useState(false)
  const [callbackCount, setCallbackCount] = useState(0)
  const controlledState = open ? 'open' : 'closed'

  function handleOpenChange(nextOpen: boolean) {
    setCallbackCount((currentCount) => currentCount + 1)
    setOpen(nextOpen)
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
    <article className={panelClassName}>
      <h3 className="text-sm font-bold text-[var(--color-ink)]">Controlled</h3>
      <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
        부모 상태가 표시 여부를 결정하고 모든 변경 요청을 셉니다.
      </p>
      <dl className="mt-4 grid gap-1 text-sm text-[var(--color-text)]">
        <div data-testid="dialog-controlled-state">
          controlled: {controlledState}
        </div>
        <div data-testid="dialog-controlled-callback-count">
          callback count: {callbackCount}
        </div>
      </dl>
      <button
        className={`${secondaryButtonClassName} mt-4`}
        data-testid="dialog-controlled-ref-open"
        type="button"
        onClick={handleRefOpen}
      >
        ref.open()으로 열기
      </button>
      <Dialog ref={dialogRef} open={open} onOpenChange={handleOpenChange}>
        <Dialog.Trigger
          className={triggerClassName}
          data-testid="dialog-controlled-trigger"
        >
          제어 Dialog 열기
        </Dialog.Trigger>
        <Dialog.Overlay
          className={overlayClassName}
          data-testid="dialog-controlled-overlay"
        >
          <span className="sr-only">제어 다이얼로그 닫기</span>
        </Dialog.Overlay>
        <Dialog.Content
          className={contentClassName}
          data-testid="dialog-controlled-content"
        >
          <Dialog.Title className="text-base font-bold text-[var(--color-ink)]">
            제어 Dialog
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 break-keep text-[var(--color-muted)]">
            onOpenChange 요청을 받은 부모가 open 값을 갱신합니다.
          </Dialog.Description>
          <div className="mt-6 flex flex-wrap gap-2">
            <Dialog.Close
              className={closeClassName}
              data-testid="dialog-controlled-close"
            >
              닫기
            </Dialog.Close>
            <button
              className={secondaryButtonClassName}
              data-testid="dialog-controlled-ref-close"
              type="button"
              onClick={handleRefClose}
            >
              ref.close()로 닫기
            </button>
            <button
              className={secondaryButtonClassName}
              data-testid="dialog-controlled-ref-toggle"
              type="button"
              onClick={handleRefToggle}
            >
              ref.toggle()로 닫기
            </button>
          </div>
        </Dialog.Content>
      </Dialog>
    </article>
  )
}
