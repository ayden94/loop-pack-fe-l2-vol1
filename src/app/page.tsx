import { Suspense } from '@suspensive/react'

import { HomeHeroFallback, HomeSearchParams } from '@/views/home/ui/HomeView'

type HomePageProps = {
  readonly searchParams: Promise<{
    readonly scenario?: string | Array<string>
  }>
}

export default function Home({ searchParams }: HomePageProps) {
  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-(--color-ink)">
          Loopers Commerce
        </h1>
        <p className="mt-2 text-sm text-(--color-muted)">
          취향에 맞는 상품을 발견해보세요.
        </p>
      </header>

      <Suspense clientOnly fallback={<HomeHeroFallback />}>
        <HomeSearchParams searchParams={searchParams} />
      </Suspense>
    </main>
  )
}
