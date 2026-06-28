import type { ReactNode } from 'react'
import { createContext } from 'react'

import type { QueryClient } from '../core'

const QueryClientContext = createContext<QueryClient | null>(null)

type QueryProviderProps = {
  client: QueryClient
  children: ReactNode
}

function QueryProvider({ client, children }: QueryProviderProps) {
  return (
    <QueryClientContext.Provider value={client}>
      {children}
    </QueryClientContext.Provider>
  )
}

export { QueryClientContext, QueryProvider }
export type { QueryProviderProps }
