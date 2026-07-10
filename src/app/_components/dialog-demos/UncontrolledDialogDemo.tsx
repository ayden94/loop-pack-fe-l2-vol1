import { useRef } from 'react'

import { Dialog, type DialogHandle } from '@/shared/ui/dialog'

import {
  closeClassName,
  contentClassName,
  nestedContentClassName,
  nestedOverlayClassName,
  overlayClassName,
  panelClassName,
  secondaryButtonClassName,
  triggerClassName,
} from './styles'

export function UncontrolledDialogDemo() {
  const dialogRef = useRef<DialogHandle | null>(null)

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
      <h3 className="text-sm font-bold text-[var(--color-ink)]">
        Uncontrolled
      </h3>
      <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
        Trigger가 내부 상태를 열고, Close·Escape·Overlay가 닫기를 요청합니다.
      </p>
      <button
        className={`${secondaryButtonClassName} mt-4`}
        data-testid="dialog-uncontrolled-ref-open"
        type="button"
        onClick={handleRefOpen}
      >
        ref.open()으로 열기
      </button>
      <Dialog ref={dialogRef}>
        <Dialog.Trigger
          className={triggerClassName}
          data-testid="dialog-uncontrolled-trigger"
        >
          비제어 Dialog 열기
        </Dialog.Trigger>
        <Dialog.Overlay
          className={overlayClassName}
          data-testid="dialog-uncontrolled-overlay"
        >
          <span className="sr-only">비제어 다이얼로그 닫기</span>
        </Dialog.Overlay>
        <Dialog.Content
          className={contentClassName}
          data-testid="dialog-uncontrolled-content"
        >
          <Dialog.Title className="text-base font-bold text-[var(--color-ink)]">
            비제어 Dialog
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 break-keep text-[var(--color-muted)]">
            open이 없으면 Dialog가 상태를 관리합니다.
          </Dialog.Description>
          <div className="mt-6 flex flex-wrap gap-2">
            <Dialog.Close
              className={closeClassName}
              data-testid="dialog-uncontrolled-close"
            >
              닫기
            </Dialog.Close>
            <Dialog.Close
              className={secondaryButtonClassName}
              data-testid="dialog-uncontrolled-prevented-close"
              onClick={(event) => {
                event.preventDefault()
              }}
            >
              닫기 방지
            </Dialog.Close>
            <button
              className={secondaryButtonClassName}
              data-testid="dialog-uncontrolled-ref-close"
              type="button"
              onClick={handleRefClose}
            >
              ref.close()로 닫기
            </button>
            <button
              className={secondaryButtonClassName}
              data-testid="dialog-uncontrolled-ref-toggle"
              type="button"
              onClick={handleRefToggle}
            >
              ref.toggle()로 닫기
            </button>
          </div>
          <div className="mt-6 border-t border-[var(--color-border-soft)] pt-6">
            <Dialog>
              <Dialog.Trigger
                className={secondaryButtonClassName}
                data-testid="dialog-nested-trigger"
              >
                중첩 Dialog 열기
              </Dialog.Trigger>
              <Dialog.Overlay
                className={nestedOverlayClassName}
                data-testid="dialog-nested-overlay"
              >
                <span className="sr-only">중첩 다이얼로그 닫기</span>
              </Dialog.Overlay>
              <Dialog.Content
                className={nestedContentClassName}
                data-testid="dialog-nested-content"
              >
                <Dialog.Title className="text-base font-bold text-[var(--color-ink)]">
                  중첩 Dialog
                </Dialog.Title>
                <Dialog.Description className="mt-2 text-sm leading-6 break-keep text-[var(--color-muted)]">
                  가장 위에 열린 이 레이어만 먼저 닫힙니다.
                </Dialog.Description>
                <Dialog.Close
                  className={`${closeClassName} mt-6`}
                  data-testid="dialog-nested-close"
                >
                  중첩 Dialog 닫기
                </Dialog.Close>
              </Dialog.Content>
            </Dialog>
          </div>
        </Dialog.Content>
      </Dialog>
    </article>
  )
}
