import { useContext } from 'react'

import type { QueryClient } from '../core'
import { QueryClientContext } from './QueryProvider'

function useQueryClient(): QueryClient {
  const client = useContext(QueryClientContext)
  if (client === null) {
    throw new Error(
      'useQueryClient must be used within a QueryProvider. ' +
        'Wrap your component tree with <QueryProvider client={queryClient}>.',
    )
  }

  return client
}

export { useQueryClient }
