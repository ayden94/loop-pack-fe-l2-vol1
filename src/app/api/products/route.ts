import { NextResponse } from 'next/server'

import type {
  Product,
  ProductCategory,
  ProductListResponse,
} from '@/entities/product'

export const dynamic = 'force-dynamic'

type ProductSeed = readonly [
  id: number,
  name: string,
  category: ProductCategory,
  price: number,
  originalPrice: number | null,
  stock: number,
  imageText: string,
  createdDaysAgo: number,
  rating: number,
  reviewCount: number,
]

const CATEGORY_IMAGE_TONES: Record<ProductCategory, string> = {
  electronics: '333',
  fashion: '666',
  home: '999',
  beauty: 'c66',
}

const PRODUCT_SEEDS = [
  [
    1,
    '무선 노이즈캔슬링 헤드폰',
    'electronics',
    289000,
    389000,
    12,
    'Headphone',
    2,
    4.7,
    1842,
  ],
  [
    2,
    '메커니컬 키보드 87키',
    'electronics',
    165000,
    null,
    3,
    'Keyboard',
    30,
    4.5,
    932,
  ],
  [
    3,
    '스마트워치 5세대',
    'electronics',
    419000,
    499000,
    0,
    'Watch',
    60,
    4.6,
    2104,
  ],
  [4, '미니멀 백팩 25L', 'fashion', 89000, 119000, 24, 'Backpack', 5, 4.3, 412],
  [5, '러닝 스니커즈', 'fashion', 142000, null, 8, 'Sneakers', 14, 4.4, 687],
  [6, '울 코트 오버사이즈', 'fashion', 329000, 459000, 5, 'Coat', 90, 4.2, 154],
  [7, '데님 셔츠', 'fashion', 59000, null, 32, 'Shirt', 1, 4.1, 89],
  [8, '캔들 워머 램프', 'home', 78000, null, 17, 'Candle', 45, 4.6, 521],
  [9, '리넨 침구 세트', 'home', 159000, 199000, 6, 'Bedding', 20, 4.5, 743],
  [10, '원목 사이드 테이블', 'home', 219000, null, 2, 'Table', 100, 4.4, 312],
  [11, '아로마 디퓨저', 'home', 45000, 65000, 41, 'Diffuser', 7, 4.3, 1023],
  [12, '비건 립밤 3종', 'beauty', 28000, null, 55, 'Lipbalm', 3, 4.2, 234],
  [
    13,
    '비타민 C 세럼 30ml',
    'beauty',
    52000,
    78000,
    19,
    'Serum',
    11,
    4.7,
    2891,
  ],
  [14, '클렌징 오일', 'beauty', 38000, null, 0, 'Cleanser', 70, 4.4, 645],
  [15, '선크림 SPF50+', 'beauty', 32000, 42000, 4, 'Suncream', 15, 4.6, 1502],
  [
    16,
    '블루투스 스피커',
    'electronics',
    99000,
    null,
    22,
    'Speaker',
    25,
    4.3,
    478,
  ],
  [17, '게이밍 마우스', 'electronics', 79000, 109000, 14, 'Mouse', 6, 4.5, 821],
  [18, '캐시미어 머플러', 'fashion', 119000, null, 1, 'Muffler', 80, 4, 67],
  [19, '캠핑 의자', 'home', 89000, 119000, 9, 'Chair', 40, 4.4, 396],
  [20, '바디로션 500ml', 'beauty', 24000, null, 67, 'Lotion', 4, 4.1, 156],
  [
    21,
    '4K 모니터 27인치',
    'electronics',
    449000,
    599000,
    7,
    'Monitor',
    18,
    4.7,
    1284,
  ],
  [22, '와이드 슬랙스', 'fashion', 79000, null, 28, 'Pants', 9, 4.2, 312],
  [23, '주방 매트', 'home', 38000, 52000, 35, 'Mat', 2, 4.3, 218],
  [24, '핸드크림 세트', 'beauty', 35000, null, 11, 'Handcream', 50, 4.5, 487],
  [
    25,
    '무선 충전기 패드',
    'electronics',
    45000,
    null,
    0,
    'Charger',
    120,
    4,
    234,
  ],
  [26, '베이지 후드티', 'fashion', 69000, 89000, 18, 'Hoodie', 3, 4.4, 542],
  [27, '미니 가습기', 'home', 32000, null, 23, 'Humidifier', 16, 4.1, 198],
  [28, '향수 50ml', 'beauty', 128000, 158000, 5, 'Perfume', 22, 4.8, 3421],
  [29, '태블릿 11인치', 'electronics', 689000, null, 4, 'Tablet', 35, 4.6, 891],
  [30, '캔버스 스니커즈', 'fashion', 49000, null, 42, 'Canvas', 1, 4.2, 178],
] satisfies ReadonlyArray<ProductSeed>

const DAY_MS = 1000 * 60 * 60 * 24
const NOW = Date.now()
const PRODUCTS = PRODUCT_SEEDS.map(createProduct)

export function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams
  const filteredProducts = applyFilters(searchParams)
  const responseBody = paginate(filteredProducts, searchParams)

  return NextResponse.json(responseBody)
}

function createProduct(seed: ProductSeed): Product {
  const [
    id,
    name,
    category,
    price,
    originalPrice,
    stock,
    imageText,
    createdDaysAgo,
    rating,
    reviewCount,
  ] = seed
  const product = {
    id,
    name,
    category,
    price,
    stock,
    imageUrl: `https://placehold.co/300x300/${CATEGORY_IMAGE_TONES[category]}/fff?text=${imageText}`,
    createdAt: new Date(NOW - createdDaysAgo * DAY_MS).toISOString(),
    rating,
    reviewCount,
  }

  return originalPrice === null ? product : { ...product, originalPrice }
}

function applyFilters(params: URLSearchParams): Array<Product> {
  const category = params.get('category')
  const minPrice = Number(params.get('minPrice') ?? Number.NaN)
  const maxPrice = Number(params.get('maxPrice') ?? Number.NaN)
  const searchQuery = params.get('q')?.trim().toLowerCase()
  const inStockOnly = params.get('inStock') === 'true'

  const filtered = PRODUCTS.filter((product) => {
    const matchesCategory =
      category === null || category === 'all' || product.category === category
    const matchesMinPrice =
      !Number.isFinite(minPrice) || product.price >= minPrice
    const matchesMaxPrice =
      !Number.isFinite(maxPrice) || product.price <= maxPrice
    const matchesSearchQuery =
      searchQuery === undefined ||
      product.name.toLowerCase().includes(searchQuery)
    const matchesStock = !inStockOnly || product.stock > 0

    return (
      matchesCategory &&
      matchesMinPrice &&
      matchesMaxPrice &&
      matchesSearchQuery &&
      matchesStock
    )
  })

  return sortProducts(filtered, params.get('sort'))
}

function sortProducts(
  products: Array<Product>,
  sort: string | null,
): Array<Product> {
  switch (sort) {
    case 'price-asc':
      return products.toSorted((first, second) => first.price - second.price)
    case 'price-desc':
      return products.toSorted((first, second) => second.price - first.price)
    case 'popular':
      return products.toSorted(
        (first, second) => second.reviewCount - first.reviewCount,
      )
    case 'latest':
    default:
      return products.toSorted(
        (first, second) =>
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime(),
      )
  }
}

function paginate(
  products: Array<Product>,
  params: URLSearchParams,
): ProductListResponse {
  const page = toPositiveInteger(params.get('page'), 1)
  const size = toPositiveInteger(params.get('size'), 12)
  const start = (page - 1) * size

  return {
    products: products.slice(start, start + size),
    totalCount: products.length,
  }
}

function toPositiveInteger(value: string | null, fallback: number): number {
  const parsed = Number(value)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}
