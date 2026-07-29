# Week 06 FSD 마이그레이션 RFC

## 기준선과 범위

- `WEEK06_BASE`: `ade5afff39eb6c9afbb2d699b1141776d665afef`
- RFC 생성과 `src/**` 변경 이전에 캡처했다.
- 필수 커밋 장벽: 이 RFC는
  `docs(week-06): add FSD RFC and behavior baseline`으로 추가하며, 이후에만
  Week 06 소스 이동을 허용한다.
- 이 RFC는 Week 05 동작 계약을 기록한다. 프로덕션 소스 파일을 이동하거나
  이름을 바꾸지 않는다.

## RADIO

### 요구사항

리팩터링은 홈과 상품 목록 화면, Query 기반 로딩·빈·오류 상태, nuqs URL
필터, 장바구니/위시리스트 동기화, localStorage 영속화, 접근 가능한 상품
행동을 보존해야 한다. 기존의 네 가지 상태 원본은 분리한다. 서버 데이터는
TanStack Query, 공유 가능한 필터는 nuqs, 비로그인 장바구니/위시리스트 집합은
Zustand, 일시 UI는 React 로컬 상태가 맡는다.

이번 범위는 Advanced A/B, 새 상태 라이브러리, URL `scenario` 상태, 응답
계약 변경, Pages Router, `processes`, `src/app/api/**` 이동을 제외한다. Route
Handler와 mock fixture는 프런트엔드 경계의 테스트 인프라이며 제자리에 둔다.
배럴 export를 추가하지 않으며, 이 저장소는 `views`와 실제 파일 경로 import를
사용한다.

### 아키텍처

#### 현재 문제

1. `src/widgets/product-card/ui/ProductCard.tsx`는 상품 표현인데
   `AddToCartButton`, `ToggleWishlistButton`을 직접 import한다. 따라서 상품
   카드가 사용자 행동 feature를 알고 entity 수준 카드로 이동하기 어렵다.
2. `src/widgets/product-list/ui/ProductGrid.tsx`는 다른 widget slice인
   `widgets/product-card`를 import한다. 상품 목록의 조합 책임이 자기 slice에
   모여 있지 않다.
3. cart와 wishlist model은 행동 중심인 `features/cart`, `features/wishlist`에
   있다. 하지만 두 store는 Header와 상품 행동이 함께 소비하는 영속 도메인
   상태다.
4. 현재 400, 500, schema-invalid 결과는 모두 일반 오류 문구 또는 원시 오류
   텍스트로 화면 안에 렌더링된다. 복구 가능한 인라인 실패와 예상 밖 route
   실패의 기준이 문서화되어 있지 않다.
5. route page는 이미 얇지만, route entry부터 view, widget, feature/entity까지의
   책임 경계가 완전한 마이그레이션 표로 고정되어 있지 않다.

#### 이전 트리

```txt
src/
  app/
    api/{_data,home,products}/
    {layout,page,providers}.tsx
    products/{loading,page}.tsx
  entities/product/{api,model}/
  features/
    cart/{model,ui}/
    wishlist/{model,ui}/
    product-filter/{model,ui}/
  shared/{api,lib,ui}/
  views/{home,product-list}/ui/
  widgets/
    header/ui/
    product-card/ui/
    product-list/ui/
```

#### 목표 트리

```txt
src/
  app/
    error.tsx
    {layout,page,providers}.tsx
    products/{error,loading,page}.tsx
    api/**                         # retained, outside migration scope
  entities/
    product/{api,model,ui/ProductCard.tsx}
    cart/model/CartStore.ts
    wishlist/model/WishlistStore.ts
  features/
    add-to-cart/ui/AddToCartButton.tsx
    toggle-wishlist/ui/ToggleWishlistButton.tsx
    product-filter/{model,useProductFilters.ts;ui/FilterBar.tsx}
  shared/
    api/{ApiClient,ApiErrorResponse,ApiErrorPolicy}.ts
    lib/useHydratePersistedStore.ts
    ui/DebouncedInput.tsx
  views/{home,product-list}/ui/
  widgets/
    header/ui/Header.tsx
    product-list/ui/{ProductGrid,ProductListSection}.tsx
```

마이그레이션은 명시한 목표 파일만 만든다. `src/app/api/**`는 이미 존재하며
그대로 유지하는 하위 트리고, `src/views/{home,product-list}/ui/`는 기존 view
위치를 요약한 표기다. 특히 `src/pages`, `src/_pages`, `processes`, 빈 segment,
`index.ts` 배럴은 목표 트리에 포함하지 않는다. 과제의 `_pages` 표기 대신
저장소가 승인한 `views` 레이어를 사용한다.

#### import 정책

허용하는 실제 파일 경로 import는 다음과 같다.

```ts
import { ProductCard } from '@/entities/product/ui/ProductCard'
import { AddToCartButton } from '@/features/add-to-cart/ui/AddToCartButton'
import { ProductGrid } from '@/widgets/product-list/ui/ProductGrid'
```

금지하는 import는 다음과 같다.

```ts
import { AddToCartButton } from '@/features/add-to-cart'
// Forbidden when imported by an entity: it crosses from lower entity to upper feature.
import { ToggleWishlistButton } from '@/features/toggle-wishlist/ui/ToggleWishlistButton'
import { ProductCard } from '@/widgets/product-card/ui/ProductCard'
```

첫 번째는 배럴이므로 금지한다. 두 번째는 실제 파일 경로 import이지만 entity가
import하면 하위 entity에서 상위 feature로 향하므로 금지한다. 세 번째는 서로
다른 widget slice 의존을 남긴다. 허용 방향은
`app -> views -> widgets -> features -> entities -> shared`이며, 같은 레이어의
협력은 하나의 slice 안에 두거나 상위 레이어에서 조합한다.

#### ProductCard 경계

현재 `ProductCard`는 `@/features/cart/ui/AddToCartButton`과
`@/features/wishlist/ui/ToggleWishlistButton`을 모두 import한다. Todo 3에서
카드를 `entities/product/ui/ProductCard.tsx`로 옮길 때 두 import를 모두
제거한다. entity 카드는 상품 이미지/alt, 가격, 할인, article 의미 구조와
상품 로컬의 한국 원화 `formatPrice`만 유지하고 선택적 action slot을 받는다.
`widgets/product-list/ui/ProductGrid.tsx`가 두 feature로 slot을 조합하므로,
카드에 보이는 행동은 보존하면서 `entities -> features` import를 없앤다.

#### 전체 파일 매핑

| 현재 경로                                                                 | 목표 경로                                                  | 결정 및 근거                                                                            |
| ------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `src/app/page.tsx`                                                        | 유지                                                       | 얇은 Next 라우트 진입점이 `HomeView`를 렌더링한다.                                      |
| `src/app/products/page.tsx`                                               | 유지                                                       | 얇은 Next 라우트 진입점이 `ProductListView`를 렌더링한다.                               |
| `src/app/products/loading.tsx`                                            | 유지                                                       | 상품 route 전환 로딩은 route가 계속 소유한다.                                           |
| 없음                                                                      | `src/app/error.tsx`                                        | Todo 6에서 root의 예상 밖 렌더링 오류 fallback으로 추가한다. layout 오류는 잡지 못한다. |
| 없음                                                                      | `src/app/products/error.tsx`                               | Todo 6에서 products segment의 예상 밖 Query/렌더링 오류 fallback과 reset으로 추가한다.  |
| `src/app/{layout,providers}.tsx`                                          | 유지                                                       | 앱 bootstrap, Header 조합, QueryClient, NuqsAdapter는 app에 둔다.                       |
| `src/app/api/**`                                                          | 유지, 범위 제외                                            | mock Route Handler, fixture, 테스트는 이동하거나 계약을 바꾸지 않는다.                  |
| `src/views/home/ui/HomeView.tsx`                                          | 유지                                                       | route-view 조합과 홈 query 소유를 맡는다.                                               |
| `src/views/product-list/ui/ProductListView.tsx`                           | 유지                                                       | filter와 상품 목록 widget의 route-view 조합을 맡는다.                                   |
| `src/widgets/header/ui/Header.tsx`                                        | 유지                                                       | 공통 shell widget이며 Todo 2 후 entity store를 import한다.                              |
| `src/widgets/product-list/ui/ProductGrid.tsx`                             | 유지                                                       | 상품 목록 slice가 entity 카드와 action feature를 조합한다.                              |
| `src/widgets/product-list/ui/ProductListSection.tsx`                      | 유지                                                       | 같은 상품 목록 slice가 목록의 로딩/오류/빈 영역을 맡는다.                               |
| `src/widgets/product-card/ui/ProductCard.tsx`                             | `src/entities/product/ui/ProductCard.tsx`                  | 상품 전용 표현으로 이동하고 기존 widget slice를 삭제한다.                               |
| `src/features/cart/model/{CartStore,CartStore.test}.ts`                   | `src/entities/cart/model/`                                 | 영속 cart 집합은 도메인 model이므로 테스트와 계약을 유지해 이동한다.                    |
| `src/features/wishlist/model/{WishlistStore,WishlistStore.test}.ts`       | `src/entities/wishlist/model/`                             | 영속 wishlist 집합은 도메인 model이므로 테스트와 계약을 유지해 이동한다.                |
| `src/features/cart/ui/AddToCartButton.tsx`                                | `src/features/add-to-cart/ui/AddToCartButton.tsx`          | 행동 UI는 독립 사용자 행동 slice로 둔다.                                                |
| `src/features/wishlist/ui/ToggleWishlistButton.tsx`                       | `src/features/toggle-wishlist/ui/ToggleWishlistButton.tsx` | 행동 UI는 독립 사용자 행동 slice로 둔다.                                                |
| `src/features/product-filter/{model,ui}/**`                               | 유지                                                       | 하나의 filter feature가 nuqs parser, URL 갱신, filter control을 소유한다.               |
| `src/features/store-sync.test.ts`                                         | Todo 4에서 삭제                                            | module identity 검증은 실제 cross-route 동작 검증이 아니다.                             |
| `src/entities/product/api/{ProductRepository,ProductService}.ts`          | 유지                                                       | 상품 transport, schema, query key factory, stale time은 이미 함께 속한다.               |
| `src/entities/product/model/{types,ResponseSchema,ProductQuerySchema}.ts` | 유지                                                       | 상품 DTO/schema/query 도메인 계약은 product에 둔다.                                     |
| `src/shared/api/{ApiClient,ApiErrorResponse}.ts`                          | 유지, Todo 5에 `ApiErrorPolicy.ts` 추가                    | 일반 transport와 일반 오류 정책은 shared에 둔다.                                        |
| `src/shared/lib/useHydratePersistedStore.ts`                              | 유지                                                       | idempotent persistence hydration은 범용 인프라다.                                       |
| `src/shared/ui/DebouncedInput.tsx`                                        | 유지                                                       | 도메인 비종속 input primitive다.                                                        |
| `src/shared/ui/{dialog,select}/**`, `src/examples/**`, `src/popover.d.ts` | 유지                                                       | 관련 없는 재사용 UI와 예제는 건드리지 않는다.                                           |

#### 배치가 애매한 항목의 결정

| 대상                      | 비교한 대안                                                 | 최종 결정                                          | 근거                                                                                |
| ------------------------- | ----------------------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `ProductCard`             | `entities/product/ui`; `widgets/product-card`               | `entities/product/ui`                              | 행동 의존 없이 상품을 표현하며 홈/목록 조합에서 재사용한다.                         |
| `ProductGrid`             | `entities/product/ui`; `widgets/product-list/ui`            | product-list widget slice                          | 여러 상품을 배치하고 행동을 주입하므로 둘 이상의 하위 관심사를 조합한다.            |
| `CartStore`               | `features/add-to-cart/model`; `entities/cart/model`         | `entities/cart/model`                              | 영속 product-ID 집합은 add/remove UI가 아니라 cart 상태다.                          |
| `WishlistStore`           | `features/toggle-wishlist/model`; `entities/wishlist/model` | `entities/wishlist/model`                          | 영속 집합과 selector 계약은 버튼 하나와 독립된 wishlist 상태다.                     |
| 행동 버튼                 | entity UI; 개별 action feature                              | `features/add-to-cart`, `features/toggle-wishlist` | entity 상태를 소비하는 사용자 행동이며 entity 상위에서 조합할 수 있다.              |
| 상품 filter               | `views/product-list`; `features/product-filter`             | 하나의 feature 유지                                | parser/hook/control이 하나의 이름 있는 상호작용 경계를 이룬다.                      |
| 상품 query options        | product-list view API; `entities/product/api`               | entity API 유지                                    | 홈과 목록이 모두 transport/query 설정을 소비하며 key와 stale time을 한곳에 둔다.    |
| `formatPrice`             | `shared/lib`; `entities/product/ui/ProductCard.tsx`         | 상품 로컬 helper                                   | 한국 통화 정책을 포함한 private 상품 가격 표현이며 범용 cross-domain 도구가 아니다. |
| persisted-store hydration | Header 로컬 hook; `shared/lib`                              | `shared/lib` 유지                                  | idempotent `persist` hydration은 범용 인프라이고 Header가 root 호출 지점이다.       |

#### 마이그레이션 단계와 증거 게이트

1. Todo 1: 소스 이동 전에 이 RFC와 브라우저/명령 기준선을 커밋한다.
2. Todo 2: 상품/cart/wishlist 소유권과 action feature UI를 옮기되 persistence
   shape, key, version, selector, hydration을 유지한다.
3. Todo 3: 순수 ProductCard를 옮기고 product-list에서 action slot을 조합한다.
   product-card widget slice와 카드의 모든 feature import를 제거한다.
4. Todo 4: 직접 실제 파일 경로 import를 다시 연결하고 app/view/widget 소유와
   네 상태 원본을 보존한다.
5. Todo 5: 화면 문구를 shared에 넣지 않는 일반 transport 오류 분류와 Query
   정책을 추가한다.
6. Todo 6: 명시적인 로딩 소유권과 함께 인라인 복구 및 route boundary를 추가한다.
7. Todo 7: 전체 자동화·브라우저 접근성/행동 matrix를 실행한다.
8. Todo 8: 삭제 시나리오를 검증하고 AI 검토 결과와 PR을 정리한다.

각 단계는 좁은 테스트를 먼저 실행하고 완료 전에 `pnpm check`를 실행한다.
최종 감사는 상향/교차 slice import와 모든 `src/app/api/**` 마이그레이션을
거부한다.

### 데이터 모델

| 상태                          | 원본                | 이동 후 소유자                          | 소비자                      | 중복 저장 방지 규칙                                                      |
| ----------------------------- | ------------------- | --------------------------------------- | --------------------------- | ------------------------------------------------------------------------ |
| 홈 응답                       | 서버/TanStack Query | `entities/product/api`, HomeView        | 홈 view/widget              | banner/categories/products를 Zustand에 복사하지 않는다.                  |
| 상품 목록 응답                | 서버/TanStack Query | `entities/product/api`, ProductListView | 목록 widget                 | query key에는 검증된 목록 query만 넣는다.                                |
| `q`, category, sort, page     | URL/nuqs            | `features/product-filter`               | ProductListView, FilterBar  | 최종 filter를 React/Zustand에 복제하지 않는다. input draft만 일시적이다. |
| cart item ID                  | Zustand             | `entities/cart/model`                   | Header와 add-to-cart action | Product 데이터가 아닌 `{ items: Record<productId, true> }`만 저장한다.   |
| wishlist item ID              | Zustand             | `entities/wishlist/model`               | Header와 wishlist action    | Product 데이터가 아닌 `{ items: Record<productId, true> }`만 저장한다.   |
| Dialog/dropdown과 input draft | React 로컬 상태     | 렌더링 컴포넌트                         | 로컬 UI                     | cross-view 필요가 없으면 일시 상태를 승격하지 않는다.                    |

영속 계약은 `commerce-cart`, `commerce-wishlist`이며 둘 다 version `1`이고
`items`만 저장한다. Zod가 저장된 `items`를 검증하며 잘못된 값은 빈 상태로
폴백한다. `skipHydration`으로 SSR은 비어 있는 상태를 렌더하고,
`useHydratePersistedStore`가 Header mount 후 한 번 `rehydrate()`를 호출한다.

### 인터페이스

slice는 slice-root API가 아닌 실제 파일을 직접 노출한다. 소비자는 필요한 named
export가 있는 정확한 파일을 import한다. Product Card의 인터페이스는 상품과 표현
전용 props, 선택적 action node가 된다. action 버튼은 계속 `productId`,
`productName`을 받고 자기 selector/action만 구독한다.

`ProductService`는 `home`, `product.list(query)` query key를 유지한다.
`ProductRepository`는 API-schema 경계로 남는다. `FilterBar`는
`useProductFilters`에서 filter와 갱신 callback을 받고 별도 filter store를 만들지
않는다. 배럴을 도입하지 않으므로 내부 helper와 migration schema는 실제 파일 안에
private으로 둔다.

### 최적화

홈은 `staleTime: 60_000`, 상품 목록은 `staleTime: 30_000`을 유지한다. 둘 다
기본 Query `gcTime`, 기존 query key, 500 ms mock delay를 유지한다. 홈 query의
`isPending`은 홈 콘텐츠 로딩을 맡고, `src/app/products/loading.tsx`는 상품 route
전환 로딩을 맡으며, 상품 목록의 `isPending`은 FilterBar를 유지한 채 결과 영역을
교체한다. cache를 Zustand에 복사하거나 측정 없는 memoization, 새 최적화 라이브러리를
추가하지 않는다.

## 오류와 복구 정책

| 실패               | 현재 기준선 관찰                                                                                  | 목표 처리                                            | boundary/retry 결정                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 빈 2xx             | 상품 목록은 `총 0개`, `검색 결과가 없습니다.`를, 홈은 두 `표시할 상품이 없습니다.` 영역을 보인다. | 인라인 빈 영역을 유지한다.                           | 오류가 아니므로 retry/boundary가 없다.                                                                 |
| 인식된 400         | 두 route가 `요청 중 오류가 발생했습니다.`를 보이고 목록 filter는 남는다.                          | 목록/홈 콘텐츠 영역에서 인라인 처리하고 재시도한다.  | route boundary로 전파하지 않는다. 사용자가 수정/재시도할 수 있다.                                      |
| 500 또는 transport | 두 route가 현재 같은 일반 인라인 오류를 보인다.                                                   | 공유 분류 후 route segment 오류 fallback으로 보낸다. | 인식된 5xx/transport에 한해 Query retry를 한 번 허용한다.                                              |
| schema-invalid 2xx | 원시 Zod issue JSON이 인라인으로 렌더링된다.                                                      | 예상 밖 오류 분기로 처리한다.                        | boundary로 전파하며 retry하지 않는다.                                                                  |
| 렌더링 오류        | 아직 route `error.tsx`가 없다.                                                                    | root/products route 오류 파일을 둔다.                | Next `reset` 전에 Query reset을 호출한다. Error Boundary는 event handler/async callback을 잡지 못한다. |
| cart/wishlist 행동 | 로컬 Zustand action에는 원격 실패가 없다.                                                         | 새 오류 처리를 추가하지 않는다.                      | 외부 경계가 생기기 전까지 해당 없다.                                                                   |

Todo 5는 일반 `ApiErrorPolicy`만 추가한다. Todo 6에서 사용자 문구, 인라인 retry
상태, route `error.tsx`를 제공한다. 임시 cookie instrumentation으로 기존 UI를
관찰하더라도 `src/app/api/**`는 마이그레이션 범위 밖이다.

## 기준선 특성화

### 자동화 명령

| 명령                              | 결과                                                                                                                                                                             | 증거                                                  |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `pnpm format:check`               | 소스 작업 전에는 `.github/workflows/quality.yml`, `docs/assets/week-05-product-images.md` 두 tracked 파일이 Prettier 형식이 아니어서 실패했다. 이후 별도 문서 커밋으로 해결했다. | `.omo/evidence/week06-fsd/todo-1/baseline-quality.md` |
| `pnpm check`                      | 8개 test file, 95개 테스트와 lint, typecheck, production build가 통과했다.                                                                                                       | `.omo/evidence/week06-fsd/todo-1/baseline-quality.md` |
| 임시 handler `pnpm typecheck`     | cookie seam이 존재할 때 통과했다.                                                                                                                                                | `.omo/evidence/week06-fsd/todo-1/cleanup-receipt.md`  |
| 복원 뒤 `git diff -- src/app/api` | 출력 없이 통과했다.                                                                                                                                                              | `.omo/evidence/week06-fsd/todo-1/cleanup-receipt.md`  |

### 일반 브라우저 흐름

| 흐름                      | 정확한 브라우저 행동과 selector                                                                                                  | 관찰 결과                                                                                                   | 결과/증거                                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 홈 로딩과 정상 데이터     | `/`로 이동하고 초기 snapshot의 `홈 데이터를 불러오는 중…`을 확인한 뒤 `인기 상품` heading을 기다린다.                            | banner, category, 인기/신상품 각 6개 카드, 이미지 alt, 가격, 행동 이름이 렌더링된다.                        | 통과: `home-initial.yml`, `home-normal.yml`, `home-normal.png`                                              |
| 홈에서 cart/wishlist 추가 | `메이커스 투명케이스 위시리스트`, `메이커스 투명케이스 장바구니` 버튼을 클릭한다.                                                | Header가 `위시리스트 1`, `장바구니 1`로 바뀐다.                                                             | 통과: `home-after-wishlist.yml`                                                                             |
| route 간 동기화           | `상품` navigation link를 클릭하고 목록을 기다린다.                                                                               | products Header도 `1`/`1`이고 상품 control이 렌더링된다.                                                    | 통과: `products-normal.yml`                                                                                 |
| 상품 목록 로딩/정상       | 실제 `goto('/products', { waitUntil: 'commit' })` 뒤 `총 30개` 없이 로딩 텍스트를 기다려 캡처하고, 이어 loaded count를 기다린다. | 대기 중에는 `상품을 불러오는 중…`만 노출된다. 이어서 `총 30개`, `1 / 3`, 12개 카드, 활성 `다음`이 노출된다. | 통과: `products-loading-real.png`, `products-loaded-after-real.png`, `products-loading-real-observation.md` |
| pagination/뒤로/앞으로    | `다음`을 클릭하고 Back, 실제 브라우저 `goForward()`를 실행한다.                                                                  | URL이 `/products?page=2`, `/products`, `/products?page=2` 순으로 복원된다.                                  | 통과: Playwright action log와 browser matrix                                                                |
| 검색/filter/sort URL      | `검색` textbox에 `스탠리`를 입력하고 `홈`, `높은 가격순`을 선택한다.                                                             | URL에 `q`, `category=home`, `sort=price-desc`가 있고 4개 항목을 보인다.                                     | 통과: `products-filter-search.yml`                                                                          |
| 새로고침 URL 상태         | 정확한 filter URL로 이동한다.                                                                                                    | 검색어, 선택한 category/sort, 4개 결과가 복원된다.                                                          | 통과: `products-filter-persisted.yml`                                                                       |
| 영속 store 상태           | 홈 행동 뒤 filter된 products를 새로고침하고 localStorage를 확인한다.                                                             | `commerce-cart`, `commerce-wishlist` 모두 version `1`의 `p21`을 가지며 Header는 `1`/`1`이다.                | 통과: `persisted-state.json`, `products-filter-persisted.yml`                                               |

### cookie 제어 강제 상태

임시 개발 전용 `week06-baseline-scenario` cookie는 일반 기준선 뒤 기존 home/products
handler에 적용했다. URL, nuqs parser, `ProductListQuery`, query key에는 넣지 않았다.
각 경우 실제 전체 브라우저 이동으로 새 query를 강제했다. handler 변경은 RFC 생성 전에
제거했다.

| route       | cookie           | 실제 브라우저 관찰                                                         | 결과/증거                                                          |
| ----------- | ---------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `/products` | `empty`          | `총 0개`, `검색 결과가 없습니다.`, pagination `1 / 1`                      | 통과: `products-empty.yml`, `products-empty.png`                   |
| `/products` | `400`            | filter control은 남고 결과 영역에 `요청 중 오류가 발생했습니다.`가 보인다. | 통과: `products-400.yml`, `products-400.png`                       |
| `/products` | `500`            | 현재 일반 인라인 오류 문구가 보이고 아직 route fallback은 없다.            | 통과: `products-500.yml`, `products-500.png`                       |
| `/products` | `schema-invalid` | 결과 영역에 Zod missing-field issue JSON이 렌더링된다.                     | 통과: `products-schema-invalid.yml`, `products-schema-invalid.png` |
| `/`         | `empty`          | banner/category는 남고 두 상품 영역이 `표시할 상품이 없습니다.`를 보인다.  | 통과: `home-empty.yml`, `home-empty.png`                           |
| `/`         | `400`            | 홈 main 콘텐츠가 `요청 중 오류가 발생했습니다.`를 보인다.                  | 통과: `home-400.yml`                                               |
| `/`         | `500`            | 홈 main 콘텐츠가 `요청 중 오류가 발생했습니다.`를 보인다.                  | 통과: `home-500.yml`                                               |
| `/`         | `schema-invalid` | 홈이 Zod missing-field issue JSON을 렌더링한다.                            | 통과: `home-schema-invalid.yml`, `home-schema-invalid.png`         |

### 정리와 적대적 probe

| probe                   | 결과                                                                                                                                                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 잘못된 cookie           | `malformed-cookie-value`는 override를 고르지 않았고 products는 정상 30개 view를 보였다. 증거: `cookie-malformed.txt`, `products-malformed-cookie-normal.yml`.                                                           |
| HMR 없는 stale 상태     | products empty를 반복하고 `Max-Age=0`으로 cookie를 지운 뒤 source/HMR 변경 없이 일반 이동하여 `총 30개`를 확인했다. 증거: `products-empty-repeat.yml`, `cookie-deleted.txt`, `products-normal-after-cookie-delete.yml`. |
| flaky 핵심 UI 확인      | empty 상태를 반복 관찰했고 같은 문구를 얻었다.                                                                                                                                                                          |
| dirty worktree          | 초기 `git status --short`는 비어 있었고, 특성화 동안 ignored `.omo` 증거만 존재했다. 사용자 변경을 덮어쓰거나 stage하지 않았다.                                                                                         |
| bounded dev server      | 첫 실행은 잘못된 `pnpm dev -- --port` 형식으로 즉시 실패했고, 수정한 실행은 Ready 뒤 PID 종료로 port 3106을 비웠다. 증거: `dev-server.log`, cleanup receipt.                                                            |
| 오해를 부르는 성공 출력 | 명령 텍스트만 믿지 않고 browser snapshot, screenshot, localStorage, API diff, process/port, exit code를 확인했다.                                                                                                       |
| 반복 중단 정리          | browser를 닫고 cookie를 지우고 server를 중지했으며 port가 비었음을 문서/커밋 전에 확인했다.                                                                                                                             |
| prompt injection        | 해당 없음: 신뢰하지 않는 prompt/문서를 실행 지시로 사용하지 않았다.                                                                                                                                                     |
| cancel/resume           | 해당 없음: 외부의 장기 취소 가능 작업을 쓰지 않았고 dev process에는 직접 PID 정리 경로가 있었다.                                                                                                                        |

## 삭제 시나리오

### wishlist 제거

마이그레이션 뒤 `src/entities/wishlist/model/WishlistStore.ts`, 해당 test,
`src/features/toggle-wishlist/ui/ToggleWishlistButton.tsx`를 삭제한다.
`src/widgets/header/ui/Header.tsx`에서는 wishlist count/hydration을 제거하고,
`src/widgets/product-list/ui/ProductGrid.tsx`에서는 wishlist action slot만 뺀다.
상품 schema, filter, shared API, route handler 변경은 필요하지 않아야 한다. 이 예측이
틀리면 최종 구조의 응집도는 부족하다.

### 신상품 badge 추가

`entities/product/ui/ProductCard.tsx`에 상품 연령/badge 표현을 추가한다. 홈/목록
layout이 opt-in해야 하면 product-list widget의 카드 조합을 바꾸고 route view는
그대로 둔다. 기존 `createdAt`으로 badge를 계산할 수 없다면 그때만 Product API/model을
바꾼다. 예상 변경 반경을 product entity와 product-list widget으로 제한한다.

## FSD 이해 확인 답변

1. ProductCard가 wishlist 버튼을 import하면 entity가 feature를 import하여
   하위에서 상위로 향하는 의존 방향을 어긴다. 두 관심사보다 상위인 ProductGrid가
   action slot을 조합하며, page별 변형이 필요하면 view도 조합할 수 있다.
2. 한 page의 검색 상호작용이 자동으로 feature가 되는 것은 아니다. 이 프로젝트는
   parser, URL 계약, FilterBar가 하나의 이름 있는 상호작용 경계를 이루므로
   product-filter를 하나의 feature로 유지한다.
3. `formatPrice`가 항상 shared인 것은 아니다. 여기서는 한국 원화 정책을 포함한
   상품 가격 표현이므로 product-local로 둔다. 실제 다중 도메인 caller와 안정적인
   통화/회원 가격 정책이 생길 때만 Money value object 또는 shared 도구를 검토한다.
4. feature끼리는 직접 import하지 않는다. widget이 add-to-cart와 toggle-wishlist를
   entity 카드 옆에서 조합하므로 각 feature 내부는 독립적이다.
5. Query 데이터와 Zustand 데이터를 복사하지 않는 이유는 원본과 수명이 다르기
   때문이다. Query는 서버 snapshot/cache를, Zustand는 비로그인 product-ID 집합을
   소유한다. 복사는 이점 없이 stale 동기화 책임만 만든다.
6. 배럴은 경로를 줄이기 위한 재export이고, public API는 외부에 알려도 되는 계약을
   선언한다. 이 저장소는 둘 다 사용하지 않고 실제 파일 경로 import를 택해 의존
   경로와 변경 반경을 드러낸다.

## AI 지원과 검토 기록

AI는 코드베이스 inventory, 기준선 브라우저 절차, 임시 미커밋 instrumentation,
RFC 초안에 도움을 주었다. 개발자는 캡처한 selector, 상태 계약, source ownership,
임시 handler diff, cleanup receipt를 직접 검토했다.

| 검토 항목                                                  | 처리 | 근거                                                                                       |
| ---------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------ |
| 과제의 `_pages` 대신 `views` 사용                          | 수용 | 저장소 FSD 규칙이 route 조합에 `views`를 명시한다.                                         |
| 실제 파일 경로 import 사용                                 | 수용 | 저장소 규칙이 습관적 `index.ts` 배럴을 금지한다.                                           |
| ProductCard를 entity에 두고 widget에서 action slot 조합    | 수용 | 보이는 control을 유지하면서 entity-to-feature 압력을 제거한다.                             |
| slice-root public barrel을 추가하라는 일반 FSD 조언        | 반려 | 저장소의 직접 import 결정과 충돌한다.                                                      |
| `src/app/api/**`를 프런트엔드 파일과 함께 이동             | 반려 | 명시적으로 마이그레이션 범위 밖이며 임시 seam은 제거했다.                                  |
| test cookie 또는 scenario query key를 영구 추가            | 반려 | 사용자 URL/상태 계약과 mock 동작을 바꾼다.                                                 |
| products 로딩 증거가 loaded 상태를 보인다는 독립 검토 지적 | 수용 | 실제 pending navigation에서 로딩 텍스트와 loaded count의 상호 배타성을 캡처해 교체했다.    |
| 두 route boundary 파일이 file map에 없다는 독립 검토 지적  | 수용 | `src/app/error.tsx`, `src/app/products/error.tsx`의 계획된 소유와 근거를 표에 추가했다.    |
| RFC의 기존 유효하지 않은 scope 표기                        | 수용 | 실제 commitlint 유효 커밋인 `docs(week-06): add FSD RFC and behavior baseline`으로 고쳤다. |

사전 두 축 검토에서는 Todo 1 명세 누락을 찾지 못했다. standards 검토가 지적한 트리
표현의 부정확성과 직접 import 예시의 오해 소지는 이미 수정했다. Markdown 형식은
staged Prettier hook으로 확인한다.
