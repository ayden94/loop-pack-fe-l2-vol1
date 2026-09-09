import {
  notifyManager,
  type QueryClient,
  useQueryClient,
} from '@tanstack/react-query'
import { act, render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { type ReactNode, useEffect } from 'react'
import { beforeEach, expect, it, vi } from 'vitest'

import { orderEntity } from '@/entities/order/api/OrderService'
import { Header } from '@/widgets/header/ui/Header'

import { createDeferred } from '../../tests/helpers/createDeferred'
import { server } from '../../tests/setup/mswServer'
import { Providers } from './providers'

const router = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => router,
  usePathname: () => '/orders',
}))
vi.mock('nuqs/adapters/next/app', () => ({
  NuqsAdapter: ({ children }: { readonly children: ReactNode }) => children,
}))

const user = { id: 'u1', name: '루퍼1', email: 'looper1@loopers.dev' }
notifyManager.setScheduler(queueMicrotask)

function QueryClientProbe({
  onReady,
}: {
  readonly onReady: (client: QueryClient) => void
}) {
  const client = useQueryClient()
  useEffect(() => {
    onReady(client)
  }, [client, onReady])
  return null
}

beforeEach(() => {
  router.replace.mockReset()
  router.refresh.mockReset()
  window.history.replaceState(null, '', '/orders')
  server.use(
    http.get('http://localhost:3000/api/auth/me', () =>
      HttpResponse.json({ user }),
    ),
  )
})

it.each(['query', 'mutation'] as const)(
  'OrderSession: real order %s receives 401 -> expires header and redirects through the production bridge',
  async (requestType) => {
    server.use(
      http.get('http://localhost:3000/api/orders', () =>
        HttpResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 }),
      ),
      http.post('http://localhost:3000/api/orders', () =>
        HttpResponse.json({ message: '로그인이 필요합니다.' }, { status: 401 }),
      ),
    )
    const ready = createDeferred<QueryClient>()
    const view = render(
      <Providers initialSession={{ status: 'authenticated', user }}>
        <Header />
        <QueryClientProbe onReady={ready.resolve} />
      </Providers>,
    )
    const client = await ready.promise
    // /me 자체가 만료 처리를 대신하지 못하도록 유효한 응답을 먼저 완료한다.
    await act(() => client.refetchQueries({ queryKey: ['auth', 'session'] }))

    await act(async () => {
      const request =
        requestType === 'query'
          ? client.fetchQuery(orderEntity.getOrders(user.id))
          : client
              .getMutationCache()
              .build(client, orderEntity.createOrder())
              .execute([{ productId: 'p1', quantity: 1 }])
      await expect(request).rejects.toBeDefined()
    })

    expect(router.replace).toHaveBeenCalledWith(
      '/login?next=%2Forders&reason=expired',
    )
    expect(screen.getByRole('link', { name: '로그인' })).toBeVisible()
    expect(
      screen.queryByRole('button', { name: '로그아웃' }),
    ).not.toBeInTheDocument()
    view.unmount()
    client.clear()
  },
)
