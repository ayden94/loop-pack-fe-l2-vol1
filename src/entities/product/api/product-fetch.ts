import type {
  ApiErrorResponse,
  HomeResponse,
  ProductListQuery,
  ProductListResponse,
} from '@/types/commerce'

export class ProductFetchError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ProductFetchError'
  }
}

const buildQueryString = (query: ProductListQuery): string => {
  const params = new URLSearchParams()
  if (query.q !== undefined && query.q !== '') params.set('q', query.q)
  if (query.category !== undefined && query.category !== 'all')
    params.set('category', query.category)
  if (query.sort !== undefined) params.set('sort', query.sort)
  if (query.page !== undefined) params.set('page', String(query.page))
  if (query.pageSize !== undefined)
    params.set('pageSize', String(query.pageSize))
  return params.toString()
}

const assertOk = async (response: Response): Promise<void> => {
  if (!response.ok) {
    const body = (await response
      .json()
      .catch(() => null)) as ApiErrorResponse | null
    throw new ProductFetchError(
      body?.message ?? '요청 중 오류가 발생했습니다.',
      response.status,
    )
  }
}

export const fetchHome = async (): Promise<HomeResponse> => {
  const response = await fetch('/api/home')
  await assertOk(response)
  return (await response.json()) as HomeResponse
}

export const fetchProductList = async (
  query: ProductListQuery,
): Promise<ProductListResponse> => {
  const qs = buildQueryString(query)
  const response = await fetch(`/api/products${qs ? `?${qs}` : ''}`)
  await assertOk(response)
  return (await response.json()) as ProductListResponse
}
