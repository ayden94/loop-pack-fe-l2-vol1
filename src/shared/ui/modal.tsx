import type { ComponentProps, ReactNode } from 'react'
import { cn } from 'tailwind-variants'

import { Heading } from './heading'

type ModalProps = ComponentProps<'div'> & {
  heading: ReactNode
  headingId: string
  footer?: ReactNode
}

export function Modal({
  children,
  className,
  footer,
  heading,
  headingId,
  ...modalProps
}: ModalProps) {
  return (
    <div
      {...modalProps}
      aria-labelledby={headingId}
      aria-modal="true"
      className={cn(
        'fixed inset-0 flex items-center justify-center bg-black/45 p-5',
        className,
      )}
      role="dialog"
    >
      <div className="max-w-90 rounded-xl bg-(--bg) p-5 text-left text-(--text)">
        <Heading.H3 id={headingId}>{heading}</Heading.H3>
        {children}
        {footer}
      </div>
    </div>
  )
}
