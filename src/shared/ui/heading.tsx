import type { ComponentProps } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const heading = tv({
  base: 'font-(family-name:--heading) font-medium text-(--text-h)',
  variants: {
    variant: {
      dialog: 'm-0 mb-2.5 text-xl leading-[118%]',
      page: 'my-2 mb-5 text-[26px] leading-[118%] tracking-[-0.5px]',
      section: 'm-0 mb-3 text-[15px] leading-[118%] tracking-normal',
    },
  },
})

type HeadingVariant = VariantProps<typeof heading>['variant']

type H1Props = ComponentProps<'h1'> & {
  variant?: HeadingVariant
}

type H2Props = ComponentProps<'h2'> & {
  variant?: HeadingVariant
}

type H3Props = ComponentProps<'h3'> & {
  variant?: HeadingVariant
}

function H1({
  children,
  className,
  variant = 'page',
  ...headingProps
}: H1Props) {
  return (
    <h1 {...headingProps} className={heading({ className, variant })}>
      {children}
    </h1>
  )
}

function H2({
  children,
  className,
  variant = 'section',
  ...headingProps
}: H2Props) {
  return (
    <h2 {...headingProps} className={heading({ className, variant })}>
      {children}
    </h2>
  )
}

function H3({
  children,
  className,
  variant = 'dialog',
  ...headingProps
}: H3Props) {
  return (
    <h3 {...headingProps} className={heading({ className, variant })}>
      {children}
    </h3>
  )
}

export const Heading = Object.assign(
  {},
  {
    H1,
    H2,
    H3,
  },
)
