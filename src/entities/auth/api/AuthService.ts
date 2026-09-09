import { queryOptions } from '@tanstack/react-query'

import { AuthRepository } from '@/entities/auth/api/AuthRepository'
import type { AuthSession } from '@/entities/auth/model/AuthSession'
import { ApiClientError } from '@/shared/api/ApiClientError'

export class AuthService {
  static readonly sessionKey = ['auth', 'session'] as const

  constructor(private readonly repository = new AuthRepository()) {}

  getSession() {
    return queryOptions({
      queryKey: AuthService.sessionKey,
      queryFn: async ({ signal }): Promise<AuthSession> => {
        try {
          const { user } = await this.repository.me(signal)
          return { status: 'authenticated', user }
        } catch (error) {
          if (error instanceof ApiClientError && error.status === 401) {
            return { status: 'anonymous' }
          }
          throw error
        }
      },
      staleTime: 0,
      refetchOnMount: false,
      refetchOnWindowFocus: true,
    })
  }
}

export const authEntity = new AuthService()
