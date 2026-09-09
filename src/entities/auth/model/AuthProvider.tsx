'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react'

import { identify, reset } from '@/analytics/logger'
import { authEntity, AuthService } from '@/entities/auth/api/AuthService'
import type { AuthUser } from '@/entities/auth/model/AuthSchema'
import type { AuthSession } from '@/entities/auth/model/AuthSession'

type AuthContextValue = {
  readonly session: AuthSession
  readonly authenticate: (user: AuthUser) => void
  readonly clearSession: () => void
  readonly expireSession: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

type AuthProviderProps = {
  readonly initialSession: AuthSession
  readonly children: ReactNode
}

export function AuthProvider({ initialSession, children }: AuthProviderProps) {
  const queryClient = useQueryClient()
  const { data: session } = useQuery({
    ...authEntity.getSession(),
    initialData: initialSession,
  })
  const serverSnapshotRef = useRef(initialSession)
  const expiringRef = useRef(false)
  const identifiedRef = useRef(false)

  useEffect(() => {
    if (serverSnapshotRef.current === initialSession) {
      return
    }
    serverSnapshotRef.current = initialSession
    void queryClient.invalidateQueries({ queryKey: AuthService.sessionKey })
  }, [initialSession, queryClient])

  useLayoutEffect(() => {
    if (identifiedRef.current) {
      return
    }
    identifiedRef.current = true
    if (initialSession.status === 'authenticated') {
      identify(initialSession.user.id)
    }
  }, [initialSession])

  const removeProtectedState = useCallback(() => {
    queryClient.removeQueries({
      predicate: (query) => query.meta?.requiresAuth === true,
    })
    const mutationCache = queryClient.getMutationCache()
    for (const mutation of mutationCache.findAll({
      predicate: (candidate) => candidate.meta?.requiresAuth === true,
    })) {
      mutationCache.remove(mutation)
    }
  }, [queryClient])

  const setSession = useCallback(
    (nextSession: AuthSession) => {
      // 새 로그인·로그아웃보다 먼저 시작한 /me 응답이 상태를 되돌리지 못하게 한다.
      void queryClient.cancelQueries({ queryKey: AuthService.sessionKey })
      queryClient.setQueryData(AuthService.sessionKey, nextSession)
    },
    [queryClient],
  )

  const authenticate = useCallback(
    (user: AuthUser) => {
      expiringRef.current = false
      removeProtectedState()
      setSession({ status: 'authenticated', user })
    },
    [removeProtectedState, setSession],
  )

  const clearSession = useCallback(() => {
    expiringRef.current = false
    removeProtectedState()
    reset()
    setSession({ status: 'anonymous' })
  }, [removeProtectedState, setSession])

  const expireSession = useCallback(() => {
    if (expiringRef.current) {
      return
    }

    expiringRef.current = true
    removeProtectedState()
    reset()
    setSession({ status: 'expired' })
  }, [removeProtectedState, setSession])

  const value = useMemo<AuthContextValue>(
    () => ({ session, authenticate, clearSession, expireSession }),
    [authenticate, clearSession, expireSession, session],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (value === null) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return value
}
