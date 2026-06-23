import type { ComponentProps } from 'react'
import { cn } from 'tailwind-variants'

type TextareaProps = ComponentProps<'textarea'>

export function Textarea({ className, ...textareaProps }: TextareaProps) {
  return (
    <textarea
      {...textareaProps}
      className={cn(
        'box-border min-h-15 w-full flex-1 resize-y rounded-lg border border-(--border) bg-(--bg) px-2.5 py-2 font-[inherit] text-sm text-(--text-h)',
        className,
      )}
    />
  )
}
