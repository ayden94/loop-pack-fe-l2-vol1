'use client'

import './register-utilinent'

import { ModalProvider } from '@ilokesto/modal'
import type { ReactNode } from 'react'

type ProvidersProps = {
  readonly children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return <ModalProvider>{children}</ModalProvider>
}
