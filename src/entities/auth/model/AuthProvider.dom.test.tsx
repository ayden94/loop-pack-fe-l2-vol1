import { notifyManager, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { expect, it } from 'vitest'

import { AuthService } from '@/entities/auth/api/AuthService'
import type { AuthSession } from '@/entities/auth/model/AuthSession'
import { getQueryClient } from '@/shared/lib/getQueryClient'

import { createDeferred } from '../../../../tests/helpers/createDeferred'
import { server } from '../../../../tests/setup/mswServer'
import { AuthProvider, useAuth } from './AuthProvider'

const authenticated: AuthSession = {
  status: 'authenticated',
  user: { id: 'u1', name: '루퍼1', email: 'looper1@loopers.dev' },
}

notifyManager.setScheduler(queueMicrotask)

it('AuthProvider: refreshed server snapshot -> revalidates me instead of keeping mount-time state', async () => {
  const observed = createDeferred()
  server.use(
    http.get('http://localhost:3000/api/auth/me', () =>
      HttpResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 }),
    ),
  )
  const queryClient = getQueryClient()
  const view = render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialSession={authenticated}>
        <SessionStatus />
      </AuthProvider>
    </QueryClientProvider>,
  )
  const unsubscribe = queryClient.getQueryCache().subscribe(() => {
    if (
      queryClient.getQueryData<AuthSession>(AuthService.sessionKey)?.status ===
      'anonymous'
    ) {
      observed.resolve()
    }
  })

  view.rerender(
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialSession={{ status: 'anonymous' }}>
        <SessionStatus />
      </AuthProvider>
    </QueryClientProvider>,
  )
  await act(() => observed.promise)

  expect(screen.getByRole('status')).toHaveTextContent('anonymous')
  unsubscribe()
  view.unmount()
  queryClient.clear()
})

function SessionStatus() {
  const { session, clearSession } = useAuth()
  return (
    <>
      <p role="status">{session.status}</p>
      <button type="button" onClick={clearSession}>
        세션 종료
      </button>
    </>
  )
}

it('AuthProvider: session revalidation returns 401 -> discards the initial authenticated snapshot', async () => {
  server.use(
    http.get('http://localhost:3000/api/auth/me', () =>
      HttpResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 }),
    ),
  )
  const queryClient = getQueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialSession={authenticated}>
        <SessionStatus />
      </AuthProvider>
    </QueryClientProvider>,
  )

  await act(() =>
    queryClient.invalidateQueries({ queryKey: ['auth', 'session'] }),
  )

  expect(screen.getByRole('status')).toHaveTextContent('anonymous')
  queryClient.clear()
})

it('AuthProvider: logout while me is pending -> aborts the old request without restoring its user', async () => {
  const started = createDeferred()
  const release = createDeferred()
  const aborted = createDeferred()
  server.use(
    http.get('http://localhost:3000/api/auth/me', async ({ request }) => {
      request.signal.addEventListener(
        'abort',
        () => {
          aborted.resolve()
        },
        { once: true },
      )
      started.resolve()
      await release.promise
      return HttpResponse.json({ user: authenticated.user })
    }),
  )
  const queryClient = getQueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialSession={authenticated}>
        <SessionStatus />
      </AuthProvider>
    </QueryClientProvider>,
  )
  const pending = queryClient.invalidateQueries({
    queryKey: AuthService.sessionKey,
  })
  await started.promise

  await act(async () => {
    screen.getByRole('button', { name: '세션 종료' }).click()
    await aborted.promise
    release.resolve()
    await pending
  })

  expect(screen.getByRole('status')).toHaveTextContent('anonymous')
  expect(queryClient.getQueryData(AuthService.sessionKey)).toEqual({
    status: 'anonymous',
  })
  queryClient.clear()
})
