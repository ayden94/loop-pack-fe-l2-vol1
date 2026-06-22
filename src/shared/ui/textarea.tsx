import type { ComponentProps } from 'react'
import { cn } from 'tailwind-variants'

type TextareaProps = ComponentProps<'textarea'>

export function Textarea({ className, ...textareaProps }: TextareaProps) {
  return (
    <textarea
      {...textareaProps}
      className={cn(
        'min-h-[60px] w-full flex-1 resize-y box-border rounded-lg border border-(--border) bg-(--bg) px-2.5 py-2 text-sm font-[inherit] text-(--text-h)',
        className,
      )}
    />
  )
}
