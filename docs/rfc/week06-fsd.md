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
    providers.test.ts
    products/{error,loading,page}.tsx
    api/**                         # retained, outside migration scope
  entities/
    product/
      api/
        ProductRepository.ts
        ProductRepository.test.ts
        ProductService.ts
      model/
      ui/ProductCard.tsx
    cart/model/{CartStore,CartStore.test}.ts
    wishlist/model/{WishlistStore,WishlistStore.test}.ts
  features/
    add-to-cart/ui/AddToCartButton.tsx
    toggle-wishlist/ui/ToggleWishlistButton.tsx
    product-filter/{model,useProductFilters.ts;ui/FilterBar.tsx}
  shared/
    api/
      ApiClient.ts
      ApiClient.test.ts
      ApiErrorResponse.ts
      ApiErrorPolicy.ts
      ApiErrorPolicy.test.ts
    lib/useHydratePersistedStore.ts
    ui/
      DebouncedInput.tsx
      InlineQueryError.tsx
      useInlineQueryRetry.ts
  views/{home,product-list}/ui/
  widgets/
    header/ui/Header.tsx
    product-list/ui/{ProductGrid,ProductListSection}.tsx
```

Week 06에서 새로 추가하거나 이동한 최종 tracked 파일은 목표 트리에 이름을 명시한다.
`src/app/api/**`는 이미 존재하며 그대로 유지하는 하위 트리고,
`src/views/{home,product-list}/ui/`와 product model segment는 기존 파일을 유지하면서
수정한 위치를 요약한 표기다. 특히 `src/pages`, `src/_pages`, `processes`, 빈 segment,
`index.ts` 배럴은 목표 트리에 포함하지 않는다. 과제의 `_pages` 표기 대신 저장소가
승인한 `views` 레이어를 사용한다.

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
// 도메인 계층에서 가져오면 하위 레이어가 상위 레이어를 향하므로 금지한다.
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

| 현재 경로                                                                 | 목표 경로                                                           | 결정 및 근거                                                                                    |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/app/page.tsx`                                                        | 유지                                                                | 얇은 Next 라우트 진입점이 `HomeView`를 렌더링한다.                                              |
| `src/app/products/page.tsx`                                               | 유지                                                                | 얇은 Next 라우트 진입점이 `ProductListView`를 렌더링한다.                                       |
| `src/app/products/loading.tsx`                                            | 유지                                                                | 상품 route 전환 로딩은 route가 계속 소유한다.                                                   |
| 없음                                                                      | `src/app/error.tsx`                                                 | Todo 6에서 root의 예상 밖 렌더링 오류 fallback으로 추가한다. layout 오류는 잡지 못한다.         |
| 없음                                                                      | `src/app/products/error.tsx`                                        | Todo 6에서 products segment의 예상 밖 Query/렌더링 오류 fallback과 reset으로 추가한다.          |
| `src/app/{layout,providers}.tsx`                                          | 유지                                                                | 앱 bootstrap, Header 조합, QueryClient, NuqsAdapter는 app에 둔다.                               |
| 없음                                                                      | `src/app/providers.test.ts`                                         | app provider의 Query 기본 retry/throw predicate 연결과 기존 default 계약을 검증한다.            |
| `src/app/api/**`                                                          | 유지, 범위 제외                                                     | mock Route Handler, fixture, 테스트는 이동하거나 계약을 바꾸지 않는다.                          |
| `src/views/home/ui/HomeView.tsx`                                          | 유지                                                                | route-view 조합과 홈 query 소유를 맡는다.                                                       |
| `src/views/product-list/ui/ProductListView.tsx`                           | 유지                                                                | filter와 상품 목록 widget의 route-view 조합을 맡는다.                                           |
| `src/widgets/header/ui/Header.tsx`                                        | 유지                                                                | 공통 shell widget이며 Todo 2 후 entity store를 import한다.                                      |
| `src/widgets/product-list/ui/ProductGrid.tsx`                             | 유지                                                                | 상품 목록 slice가 entity 카드와 action feature를 조합한다.                                      |
| `src/widgets/product-list/ui/ProductListSection.tsx`                      | 유지                                                                | 같은 상품 목록 slice가 목록의 로딩/오류/빈 영역을 맡는다.                                       |
| `src/widgets/product-card/ui/ProductCard.tsx`                             | `src/entities/product/ui/ProductCard.tsx`                           | 상품 전용 표현으로 이동하고 기존 widget slice를 삭제한다.                                       |
| `src/features/cart/model/{CartStore,CartStore.test}.ts`                   | `src/entities/cart/model/{CartStore,CartStore.test}.ts`             | 영속 cart 집합은 도메인 model이므로 테스트와 계약을 유지해 이동한다.                            |
| `src/features/wishlist/model/{WishlistStore,WishlistStore.test}.ts`       | `src/entities/wishlist/model/{WishlistStore,WishlistStore.test}.ts` | 영속 wishlist 집합은 도메인 model이므로 테스트와 계약을 유지해 이동한다.                        |
| `src/features/cart/ui/AddToCartButton.tsx`                                | `src/features/add-to-cart/ui/AddToCartButton.tsx`                   | 행동 UI는 독립 사용자 행동 slice로 둔다.                                                        |
| `src/features/wishlist/ui/ToggleWishlistButton.tsx`                       | `src/features/toggle-wishlist/ui/ToggleWishlistButton.tsx`          | 행동 UI는 독립 사용자 행동 slice로 둔다.                                                        |
| `src/features/product-filter/{model,ui}/**`                               | 유지                                                                | 하나의 filter feature가 nuqs parser, URL 갱신, filter control을 소유한다.                       |
| `src/features/store-sync.test.ts`                                         | Todo 4에서 삭제 완료                                                | module identity 검증 대신 실제 entity test와 route 브라우저 동기화를 계약으로 삼는다.           |
| `src/entities/product/api/{ProductRepository,ProductService}.ts`          | 유지                                                                | 상품 transport, schema, query key factory, stale time은 이미 함께 속한다.                       |
| 없음                                                                      | `src/entities/product/api/ProductRepository.test.ts`                | 성공한 2xx 상품 응답이 product schema 경계를 통과하거나 거부되는 계약을 검증한다.               |
| `src/entities/product/model/{types,ResponseSchema,ProductQuerySchema}.ts` | 유지                                                                | 상품 DTO/schema/query 도메인 계약은 product에 둔다.                                             |
| `src/shared/api/{ApiClient,ApiErrorResponse}.ts`                          | 유지                                                                | 외부 오류 payload 검증과 transport 정규화는 shared에 둔다.                                      |
| 없음                                                                      | `src/shared/api/ApiErrorPolicy.ts`                                  | 화면 문구 없이 오류 class/status의 retry·throw 판정만 제공하는 공통 Query 정책이다.             |
| 없음                                                                      | `src/shared/api/ApiClient.test.ts`                                  | HTTP 오류 payload 검증, status 보존, fallback과 Ky 무재시도 transport 정규화를 검증한다.        |
| 없음                                                                      | `src/shared/api/ApiErrorPolicy.test.ts`                             | 4xx·5xx·network·timeout·schema·unknown의 retry/throw matrix를 검증한다.                         |
| `src/shared/lib/useHydratePersistedStore.ts`                              | 유지                                                                | idempotent persistence hydration은 범용 인프라다.                                               |
| `src/shared/ui/DebouncedInput.tsx`                                        | 유지                                                                | 도메인 비종속 input primitive다.                                                                |
| 없음                                                                      | `src/shared/ui/InlineQueryError.tsx`                                | 화면별 오류 message를 props로 받고 공통 alert·retry·pending 상태와 일반 retry label만 표현한다. |
| 없음                                                                      | `src/shared/ui/useInlineQueryRetry.ts`                              | refetch Promise 동안 오류 message 수명과 retry pending 상태를 유지하는 범용 hook이다.           |
| `src/shared/ui/{dialog,select}/**`, `src/examples/**`, `src/popover.d.ts` | 유지                                                                | 관련 없는 재사용 UI와 예제는 건드리지 않는다.                                                   |

`InlineQueryError`는 화면별 message를 전달받아 일반 alert와 retry 상태만 표현하고,
`useInlineQueryRetry`는 refetch 동안 message 수명만 관리한다. 홈·상품의 오류 문구는 각
view가, route fallback 문구는 app 오류 경계가 소유한다. `shared/api/ApiErrorPolicy.ts`에는
사용자 문구나 화면 정책을 넣지 않는다.

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

#### Todo 2 마이그레이션 결과

2026-07-29에 cart/wishlist 영속 상태 소유권을 entity model로 옮기고 기존 버튼을
각 action feature로 분리했다. `ProductCard`의 위치와 markup은 그대로 두고 두 버튼의
import 경로만 새 action feature로 바꿨다. Header는 cart와 wishlist entity store마다
기존 정적 hydration hook 호출을 정확히 한 번씩 유지한다.

| 검증 항목            | 결과                                                                | 증거                                                                |
| -------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 이동 전 store 특성화 | 기존 2개 파일, 29개 테스트 통과                                     | `.omo/evidence/week06-fsd/todo-2/baseline-and-structure.md`         |
| 구조 red/green       | 이동 전 목표 구조 실패, 이동 후 목표 구조 통과                      | `.omo/evidence/week06-fsd/todo-2/baseline-and-structure.md`         |
| 이동 후 store 회귀   | entity 경로의 2개 파일, 29개 테스트 통과                            | `.omo/evidence/week06-fsd/todo-2/baseline-and-structure.md`         |
| 타입과 편집기 진단   | `pnpm typecheck` 통과, 변경 파일 LSP 진단 0건                       | `.omo/evidence/week06-fsd/todo-2/baseline-and-structure.md`         |
| import와 구조 감사   | 기존 feature 경로, upward/cross-feature import, barrel 모두 0건     | `.omo/evidence/week06-fsd/todo-2/import-audit.md`                   |
| route 동기화         | 홈의 add/remove/toggle이 products Header와 같은 상품 버튼에 반영    | `.omo/evidence/week06-fsd/todo-2/manual-qa.md`                      |
| reload 영속화        | 두 key의 `p21: true`, version `1`, Header와 pressed 상태 복원       | `.omo/evidence/week06-fsd/todo-2/manual-qa.md`                      |
| 잘못된 저장값        | false/object `items`가 빈 집합으로 폴백하고 crash 없음              | `.omo/evidence/week06-fsd/todo-2/manual-qa.md`                      |
| browser console      | clean localhost session 오류 0, 기존 Image LCP 경고 1               | `.omo/evidence/week06-fsd/todo-2/browser-console-clean-session.log` |
| 실행 자원 정리       | localStorage, browser, PID/port, `.next`, Playwright residue 정리   | `.omo/evidence/week06-fsd/todo-2/cleanup-receipt.md`                |
| 전체 품질 게이트     | 95개 테스트, format, lint, typecheck, build, 최종 `pnpm check` 통과 | `.omo/evidence/week06-fsd/todo-2/quality-gates.md`                  |

#### Todo 3 마이그레이션 결과

2026-07-29에 상품 카드 표현을 `entities/product/ui/ProductCard.tsx`로 옮기고
선택적 `actions?: ReactNode` slot을 추가했다. entity 카드는 기존 image, alt,
priority/sizes, 한국 원화 가격, 할인율, `article` 의미 구조와 style을 그대로 유지한다.
`widgets/product-list/ui/ProductGrid.tsx`가 `ToggleWishlistButton`과
`AddToCartButton`을 product별로 조합해 같은 시각 위치에 전달한다. 기존
`widgets/product-card` slice는 빈 디렉터리 없이 삭제했다.

| 검증 항목          | 결과                                                                                      | 증거                                                                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 이동 전 구조 red   | entity 목표 없음, 기존 widget 존재, sibling widget import 확인                            | `.omo/evidence/week06-fsd/todo-3/baseline/structural-red.md`                                                                             |
| 이동 후 구조 green | entity 카드 존재, 기존 widget slice와 import 없음                                         | `.omo/evidence/week06-fsd/todo-3/current/structural-green.md`                                                                            |
| LSP와 TypeScript   | 변경 파일 진단 0건, caller 유지, typecheck 통과                                           | `.omo/evidence/week06-fsd/todo-3/current/structural-green.md`                                                                            |
| FSD import 감사    | entity 상향 import, product-list sibling widget import, same-layer cross-slice import 0건 | `.omo/evidence/week06-fsd/todo-3/current/structural-green.md`                                                                            |
| 홈 카드 동작       | 인기/신상품 article, alt, 가격/할인, 두 action과 Header 동기화 유지                       | `.omo/evidence/week06-fsd/todo-3/current/manual-qa.md`                                                                                   |
| 상품 목록 동작     | 기본/`메이커스` 필터 결과의 두 action, pressed, 반복 toggle, Header 동기화 유지           | `.omo/evidence/week06-fsd/todo-3/current/manual-qa.md`                                                                                   |
| 접근성과 viewport  | desktop/mobile, accessible name, Enter/Space, focus-visible 통과                          | `.omo/evidence/week06-fsd/todo-3/current/manual-qa.md`                                                                                   |
| 시각 비교          | 4쌍 0 pixel diff, products desktop은 image raster `0.0005`, layout/content 회귀 없음      | `.omo/evidence/week06-fsd/todo-3/current/visual-diff.md`                                                                                 |
| 독립 시각 검토     | 기능/design-system과 visual/CJK 두 pass 모두 blocking 없이 통과                           | `.omo/evidence/week06-fsd/todo-3/current/visual-qa-report.md`                                                                            |
| console/network    | 오류 0건, 기존 Image LCP warning만 유지, 관련 API 200                                     | `.omo/evidence/week06-fsd/todo-3/current/todo3-current-console.log`, `.omo/evidence/week06-fsd/todo-3/current/todo3-current-network.log` |
| 전체 품질 게이트   | format, 95개 test, lint, typecheck, build, 최종 `pnpm check` 통과                         | `.omo/evidence/week06-fsd/todo-3/current/quality-gates.md`                                                                               |
| 실행 자원 정리     | localStorage/cookie, browser, PID/port, `.next`, 임시 report 정리                         | `.omo/evidence/week06-fsd/todo-3/current/cleanup-receipt.md`                                                                             |

#### Todo 4 import와 상태 원본 검증 결과

2026-07-29에 route부터 shared까지 이동 consumer와 상태 원본을 다시 감사했다. 모든
production import가 이미 실제 파일 경로와 하향 방향을 만족해 import 코드는 수정하지
않았다. `src/features/store-sync.test.ts`는 삭제 전에 4개 test가 통과했지만, 자기
자신과 같은 module instance를 다시 읽는 검증이라 route 동기화 계약으로는 약했다.
이를 대체하는 path/identity test는 만들지 않고 cart/wishlist entity의 action,
selector, persistence test와 실제 브라우저 route 동기화를 계약으로 유지했다.

| 검증 항목            | 결과                                                                           | 증거                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| 삭제 전 구조 red     | obsolete test가 남아 있어 의도한 실패 발생                                     | `.omo/evidence/week06-fsd/todo-4/baseline-and-structure.md`                                                  |
| 삭제 전 특성화       | 1개 파일, 4개 test 통과; module identity와 같은 instance 재조회임을 확인       | `.omo/evidence/week06-fsd/todo-4/baseline-and-structure.md`                                                  |
| 삭제 후 실제 계약    | entity store, query key, parser의 4개 파일, 55개 test 통과                     | `.omo/evidence/week06-fsd/todo-4/baseline-and-structure.md`                                                  |
| import 방향          | upward, same-layer cross-slice, escaping relative import 모두 0건              | `.omo/evidence/week06-fsd/todo-4/import-audit.md`                                                            |
| route/provider 소유  | 두 page는 view만 렌더링하고 QueryClient/NuqsAdapter는 providers에 유지         | `.omo/evidence/week06-fsd/todo-4/import-audit.md`                                                            |
| query/cache 계약     | query key, repository 입력, 홈 60초, 목록 30초 그대로 유지                     | `.omo/evidence/week06-fsd/todo-4/import-audit.md`                                                            |
| scenario 격리        | production query type, parser/hook, query key에서 0건; test의 부재 검증만 유지 | `.omo/evidence/week06-fsd/todo-4/import-audit.md`                                                            |
| URL 직접 열기/reload | q/category/sort/page와 4개 결과가 정확히 복원                                  | `.omo/evidence/week06-fsd/todo-4/manual-qa.md`                                                               |
| history/공유         | Back/Forward 2회와 복사한 새 tab에서 control/결과가 정확히 복원                | `.omo/evidence/week06-fsd/todo-4/manual-qa.md`                                                               |
| 잘못된 query         | URL 원문을 보존하면서 page 1, category all, sort latest로 안전하게 해석        | `.omo/evidence/week06-fsd/todo-4/manual-qa.md`                                                               |
| route store 동기화   | 홈 추가 뒤 products와 reload에서 Header 1/1, 두 action pressed 유지            | `.omo/evidence/week06-fsd/todo-4/manual-qa.md`                                                               |
| console/network      | 오류 0건, 기존 Image LCP warning 1건, 관련 API 요청 성공                       | `.omo/evidence/week06-fsd/todo-4/browser-console.log`, `.omo/evidence/week06-fsd/todo-4/browser-network.log` |

Todo 5의 retry, throw, 오류 문구, route boundary 정책은 이번 변경에서 시작하지
않았다.

#### Todo 5 transport와 Query 오류 분류 결과

2026-07-29에 Ky transport와 TanStack Query의 자동 재시도 소유권을 분리했다.
`ApiErrorResponseSchema`를 먼저 정의하고 `ApiErrorResponse`는
`z.infer<typeof ApiErrorResponseSchema>`로 파생했다. Ky 2가 `beforeError` 전에
준비한 `HTTPError.data`만 schema로 parse하며, 이미 소비된 `response.json()`을
다시 호출하지 않는다. 유효한 payload는 서버 message를 보존하고 malformed shape,
malformed JSON, non-JSON payload는 status를 보존한 `ApiClientError`와 일반 fallback
message로 바뀐다. Ky의 `retry: 0` 때문에 한 Query 시도마다 underlying request는
한 번만 발생한다.

`ApiErrorPolicy`는 화면 문구나 렌더링 결정을 포함하지 않고 두 predicate만 제공한다.
Query retry callback의 `failureCount`가 첫 retry 판단에서 `0`이라는 TanStack Query
계약을 사용해 인식된 5xx, `NetworkError`, `TimeoutError`만 한 번 재시도한다.
`throwOnError`는 인식된 4xx `ApiClientError`에만 false이며 나머지는 모두 true다.
provider의 QueryClient default가 두 predicate를 소유하고 홈/목록 query options에는
중복하지 않았다. 기존 Query key, 홈 60초/목록 30초 `staleTime`, refetch 설정은
변경하지 않았다.

| 검증 항목                  | 결과                                                                                 | 증거                                                       |
| -------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| 변경 전 기준선             | 7개 test file, 91개 test와 typecheck 통과; Ky 기본 retry와 provider `retry: 1` 확인  | `.omo/evidence/week06-fsd/todo-5/baseline.md`              |
| transport red/green        | 서버 message 유실·500 3회 시도를 red로 확인하고 최종 7개 test 통과                   | `.omo/evidence/week06-fsd/todo-5/red-green.md`             |
| 오류 policy red/green      | 18개 중 의도한 6개 실패 뒤 18개 전체 통과                                            | `.omo/evidence/week06-fsd/todo-5/red-green.md`             |
| provider default red/green | 기존 숫자 retry로 1개 실패 뒤 공유 retry/throw predicate wiring 2개 통과             | `.omo/evidence/week06-fsd/todo-5/red-green.md`             |
| malformed 2xx              | ProductRepository가 1회 요청 뒤 `ZodError`를 전파하고 Query policy가 재시도하지 않음 | `.omo/evidence/week06-fsd/todo-5/red-green.md`             |
| route handler 계약         | products/home error는 500, 잘못된 products query는 400과 기존 body를 반환            | `.omo/evidence/week06-fsd/todo-5/curl-handler-contract.md` |
| 전체 품질 게이트           | test, format, lint, typecheck, build, 최종 check 통과                                | `.omo/evidence/week06-fsd/todo-5/quality-gates.md`         |
| 실행 자원 정리             | dev PID/port, `.next`, 임시 fixture/report를 정리                                    | `.omo/evidence/week06-fsd/todo-5/cleanup-receipt.md`       |

#### Todo 6 인라인 복구와 route 오류 경계 결과

2026-07-29에 기존 `QueryClientProvider` 아래에 `QueryErrorResetBoundary`를 추가했다.
QueryClient는 `useState(createQueryClient)`로 한 번만 만들며 Todo 5의 공통 retry와
`throwOnError` predicate를 그대로 상속한다. 홈과 상품 query key, 홈 60초/목록 30초
`staleTime`은 바꾸지 않았다.

인식된 4xx는 `InlineQueryError`가 각 콘텐츠 소유 영역에서 `role="alert"` 메시지와
`type="button"` retry를 제공한다. retry는 `refetch`를 호출하고 fetch 중에는 버튼을
`aria-disabled`로 비활성화해 focus를 유지하며 보이는 이름을 `다시 불러오는 중…`으로
바꾼다. data 없는 오류를
refetch하면 Query가 다시 pending이 되므로, 소유 컴포넌트가 오류 문구를 refetch
Promise 수명 동안 보존해 같은 인라인 영역이 사라지지 않게 했다. 상품 화면에서는
`FilterBar`가 결과 영역 바깥에 계속 mount되어 4xx 중에도 보인다.

예상 밖 오류는 root와 products의 `error.tsx`로 전파한다. 두 client boundary는
`Error & { digest?: string }`과 `reset: () => void` 계약을 사용하며 handler에서
`useQueryErrorResetBoundary().reset()`을 먼저 호출하고 Next `reset()`을 나중에
호출한다. root `error.tsx`는 같은 segment의 `page.tsx`와 하위 segment만 감싸므로
`layout.tsx`나 그 안의 Header 오류를 잡지 못한다. 그런 오류는 필요할 때 별도의
`global-error.tsx` 범위를 설계해야 한다. React Error Boundary는 event handler나
비동기 callback에서 나중에 throw된 오류도 잡지 않는다. 현재 cart/wishlist의 로컬
handler에는 원격 실패가 없고, 향후 생기면 handler 내부에서 예상 실패를 로컬 상태로
처리하고 예상 밖 오류는 호출 경계의 명시적 보고 경로로 전달한다.

로딩 소유권은 그대로다. 홈 Query 초기 로딩은 `HomeView`의 `isPending`이 맡는다.
상품 route 전환은 `src/app/products/loading.tsx`가 맡고, 상품 Query pending은
FilterBar를 유지한 결과 영역만 바꾼다. root에는 server-suspending 작업이 없으므로
`src/app/loading.tsx`를 추가하지 않았다.

| 실패/검증                | 직접 URL, cookie 또는 차단 방법                                                     | 기대 UI와 실제 UI                                                                                 | 복구와 요청 수                                                                                                     |
| ------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| handler home empty/error | `/api/home?scenario=empty`, `/api/home?scenario=error`                              | 200 빈 배열, 500 한국어 오류 payload를 반환했다. UI 검증으로 해석하지 않았다.                     | handler-only 증거이며 reset 없음.                                                                                  |
| handler products         | `/api/products?scenario=empty`, `/api/products?scenario=error`, 잘못된 sort         | 각각 200 빈 목록, 500 오류, 400 요청 조건 payload를 반환했다.                                     | handler-only 증거이며 reset 없음.                                                                                  |
| 홈 400                   | `week06-todo6-scenario=400` 뒤 `/`, 화면 reload 없이 cookie 삭제                    | 홈 main 안 alert와 retry가 보였다.                                                                | 자동 retry 0회, 최초 1회. pointer/Enter retry 1회 뒤 성공했고 document marker와 navigation entry 1개가 유지됐다.   |
| 상품 400                 | 같은 cookie 뒤 `/products?q=todo6400`, 화면 reload 없이 cookie 삭제                 | FilterBar 전체가 남고 결과 영역만 alert와 retry로 교체됐다.                                       | 자동 retry 0회, 최초 1회. Space/pointer retry 1회 뒤 성공했고 문서 reload가 없었다.                                |
| 홈/상품 500              | `week06-todo6-scenario=500`, fallback에서 cookie 삭제                               | route별 `표시하지 못했습니다.` 제목과 retry가 보였다.                                             | 각 initial+Query retry 정확히 2회 뒤 fallback, Query reset→Next reset 뒤 1회 성공했다.                             |
| 홈/상품 schema-invalid   | `week06-todo6-scenario=schema-invalid`인 유효하지 않은 2xx body                     | 각 route fallback으로 전파됐다.                                                                   | 각 최초 1회로 retry 없음. cookie 삭제 뒤 reset 1회로 성공했다.                                                     |
| 홈/상품 transport        | Playwright로 정확한 `/api/home` 또는 `/api/products` initial+retry 요청을 abort     | `navigator.onLine === true`인 상태에서 각 route fallback으로 전파됐다.                            | 각 2회 실패 뒤 차단을 해제하고 reset 1회로 성공했다.                                                               |
| 홈/상품 render           | 임시 render cookie의 home/products 값과 view `TypeError`                            | root와 products fallback이 각각 나타났다.                                                         | cookie와 throw 제거 뒤 pointer/Enter reset으로 성공했고 fixture 문자열은 source에서 0건이었다.                     |
| retry pending            | 실패 cookie만 삭제하고 별도 임시 slow cookie를 유지한 뒤 retry                      | 같은 alert 안 버튼이 비활성 상태이며 `다시 불러오는 중…`으로 바뀌었다.                            | 1.5초 구간에서 홈 Enter와 상품 pointer로 직접 관찰했다.                                                            |
| focus/반응형             | 375x812, 768x900, 1280x900에서 400/500 12개 캡처, Tab/Shift+Tab/Enter/Space/pointer | 가로 overflow 0, alert 1개, 상품 400 FilterBar 유지, mobile 한국어 줄바꿈 수정 뒤 전체 시각 통과. | focus outline `2px`, offset `2px`; button/message/outline contrast `15.92:1`/`5.44:1`/`18.76:1`; target `85.9x40`. |
| 잘못된 cookie            | `week06-todo6-scenario=malformed-cookie-value`                                      | override를 선택하지 않고 정상 빈 검색 결과와 retry 0개를 보였다.                                  | 정상 요청 1회로 끝났다.                                                                                            |

Todo 6 변경 전 수동 red는 retry control과 두 route `error.tsx`가 없음을 확인했다.
Todo 1 원래 기준선에서는 400/500/schema가 모두 인라인이었지만 Todo 5의
`throwOnError` 연결 뒤 Todo 6 직전 재확인에서는 400만 인라인에 남고 500/schema는
Next 기본 `This page couldn’t load`로 전파됐다. 이 차이를 숨기지 않고
`.omo/evidence/week06-fsd/todo-6/baseline/observation.md`에 두 단계로 기록했다.

독립 시각 검토 두 번은 12개 전체 최신 캡처를 읽고 각각 `PASS`, blocker 0건을
반환했다. WCAG 2.2 AA 범위 검토도 `AA-ready`였고 남은 manual-needed 두 항목은
실제 Tab 왕복과 contrast 계산으로 닫았다. forced error의 Next 개발 overlay와 console
오류는 개발 오류 표시라는 한계가 있어 캡처에서는 product가 아닌 dev portal만
제거했고, 성공 뒤 새 정상 session에서 console/network를 별도로 확인한다.

임시 cookie handler, slow delay, render throw, Playwright abort route는 모두 제거했다.
`git diff -- src/app/api`와 fixture 문자열 scan은 출력이 없으며, 최종 commit range와
API history도 다시 검사한다. 상세 요청 수, marker, capture와 cleanup은
`.omo/evidence/week06-fsd/todo-6/` 아래에 있다.

#### Todo 7 통합 회귀 검증 결과

2026-07-30에 최종 통합 상태를 기준으로 tests-after와 전체 브라우저 행렬을 다시
실행했다. 자동화는 `pnpm test`, `pnpm format:check`, `pnpm lint`,
`pnpm typecheck`, `pnpm build`, `pnpm check`를 각각 별도 process로 정확한 순서대로
실행했고 모두 exit 0이었다. Vitest는 11개 파일의 119개 테스트를 통과했다.

| 검증 영역                    | 결과 | 정확한 관찰과 증거                                                                                                                                                      |
| ---------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 자동화 6단계                 | PASS | 119 tests, format, lint, typecheck, production build와 final check 통과. `.omo/evidence/week06-fsd/todo-7/quality-gates.md`                                             |
| 홈/상품 loading·normal·empty | PASS | loading/loaded text가 상호 배타적이고, 정상 카드/alt/action, 홈 두 빈 section, 상품 FilterBar와 0개/1·1을 확인. `browser-matrix.md`                                     |
| filter/pagination            | PASS | debounce 뒤 q 반영, category/sort 변경 시 page 1, page 2 양방향과 page 3 다음 비활성. `browser-matrix.md`                                                               |
| 공유·refresh·history         | PASS | 새 page와 reload 전후 q/category/sort/상품 4개 동일, Back/Forward 두 cycle의 URL/control/result 일치. `browser-matrix.md`                                               |
| cart/wishlist                | PASS | 홈의 p21 행동이 상품 route pressed와 Header 1/1에 동기화되고 reload 뒤 version 1 storage와 함께 유지. `browser-matrix.md`                                               |
| malformed storage            | PASS | cart false와 wishlist object를 주입해도 빈 집합, Header 0/0, hydration error 0. `browser-matrix.md`                                                                     |
| 400 inline retry             | PASS | 자동 retry 0, 최초 1회, 상품 FilterBar 유지, Enter/Space retry 1회, pending label/aria-disabled/focus/2px outline, 중복 activation request 0. `browser-matrix.md`       |
| 500 boundary                 | PASS | 홈/상품 initial+retry 2회, route별 fallback, cookie 삭제와 Query+Next reset 뒤 1회 성공. `browser-matrix.md`                                                            |
| schema boundary              | PASS | 홈/상품 최초 1회와 retry 0, cookie 삭제와 reset 뒤 성공. `browser-matrix.md`                                                                                            |
| online transport             | PASS | `navigator.onLine=true`에서 exact API abort 2회, unblock과 reset 뒤 성공. `browser-matrix.md`                                                                           |
| render boundary              | PASS | 임시 root/products TypeError가 route별 fallback에 도달하고 fixture 제거 뒤 같은 document reset 성공. `browser-matrix.md`                                                |
| keyboard/ARIA                | PASS | Tab/Shift+Tab, link/button Enter, button Space, accessible 상품 행동 이름, aria-pressed, alert/atomic/busy와 focus 비가림 확인. `wcag-aa-audit.md`                      |
| contrast/target/reflow       | PASS | message 5.44:1, button 15.92:1, outline 19.80:1, retry 85.9x40; 320과 375/768/1280 기본 reflow, 필수 세 폭 text spacing 통과. `wcag-aa-audit.md`                        |
| console/network              | PASS | 강제 오류 뒤 새 clean session에서 console/page error 0, home/products API 200. 기존 p21 Image LCP 권고 1건만 기준선으로 재현. `browser-matrix.md`                       |
| 최신 시각 surface            | PASS | fixture 제거 뒤 두 route, 7 states, 3 widths의 RGB PNG 42개를 전부 다시 캡처했고 horizontal overflow 0. `.omo/evidence/week06-fsd/todo-7/visual/`                       |
| 적대적 class                 | PASS | malformed query/cookie/storage, prompt data, stale cache/artifact, dirty tree, process timeout, 반복 history/retry, 성공 출력 교차 확인을 기록. `adversarial-probes.md` |

기능 강제에는 사용자 URL이나 Query key가 아닌 임시 미커밋
`week06-todo7-scenario` cookie seam만 사용했다. retry pending용 delay와 root/products
render throw도 미커밋으로만 사용했다. 기능 검증 뒤 네 source 파일을 원본 byte 상태로
복원했고 `git diff -- src`, API diff, fixture scan은 출력이 없다. 이후 시각 증거가
stale하지 않도록 최종 source에서 browser interception으로 같은 상태의 제품 DOM만
새로 렌더링해 42개 전체를 다시 캡처했다. 개발용 Next portal host만 캡처에서 숨겼고
제품 DOM은 변경하지 않았다.

375의 긴 상품명과 `원` 줄바꿈은 Todo 2~6에서 이미 기록한 같은 좁은 2열 카드
기준선이다. 이번 작업은 세 폭에서 overflow/clipping 증가와 새 CJK 회귀가 없음을
확인했으며, 사용자가 명시한 기준선 예외에 따라 Todo 7 결함으로 고치지 않았다.
실제 screen reader 음성은 실행하지 않았으므로 특정 AT 발화까지 주장하지 않고,
fresh Chromium accessibility tree의 alert/name/state와 실제 keyboard 흐름을 증거로
한정한다.

제품 결함은 발견되지 않았다. 따라서 Todo 7의 no-standalone-commit 규칙을 지켜 이
RFC evidence-only 변경은 미커밋으로 Todo 8에 넘긴다. Todo 7에서는 normal no-op
push와 local/upstream/remote parity만 확인한다.

#### Todo 1–7 최종 마이그레이션 결과

| 단계   | 최종 변경과 경로                                                                                                   | 자동화·수동 검증                                                                                                                                                                                                           | 커밋과 전달                                                                                                                         |
| ------ | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Todo 1 | `docs/rfc/week06-fsd.md`를 소스 이동 전에 추가하고 기준선, 파일 매핑, 상태·오류 정책을 기록했다.                   | 기준선 95개 테스트와 `pnpm check` 통과. 임시 cookie seam 제거 뒤 `src/app/api/**` diff 0건.                                                                                                                                | `eba27cf`, `bcaafdb`, `0c73528`, `c46528a`, `5b34ab0`을 정상 push했다. RFC 추가 커밋 `bcaafdb`는 첫 소스 커밋 `cef21f1`의 조상이다. |
| Todo 2 | cart/wishlist store와 테스트를 `entities`로 옮기고 버튼을 `add-to-cart`, `toggle-wishlist` feature로 분리했다.     | 이동 전후 store 29개 테스트, route 동기화, version 1 영속화와 malformed 저장값 복구, 전체 95개 테스트와 품질 게이트 통과.                                                                                                  | `cef21f1`, `2433af8`, `8b26ea6`, `259db6e`, `9062dc4`를 정상 push했다.                                                              |
| Todo 3 | `ProductCard`를 `entities/product/ui`로 옮기고 `ProductGrid`가 두 action을 slot으로 조합하도록 바꿨다.             | entity 상향 import와 widget 교차 slice import 0건. 홈/상품 카드 동작, 키보드, 4쌍 0 pixel diff와 독립 시각 검토 통과.                                                                                                      | `3d84a17`, `a1ce321`을 정상 push했다.                                                                                               |
| Todo 4 | 약한 module identity 검증인 `src/features/store-sync.test.ts`를 삭제하고 실제 소비 경로와 네 상태 원본을 감사했다. | entity/query/parser 55개 집중 테스트, 전체 91개 테스트, URL 공유·새로고침·Back/Forward, route store 동기화, 빈 디렉터리 0건을 확인했다.                                                                                    | `3ba70fb`, `a5988ab`을 정상 push했다.                                                                                               |
| Todo 5 | `shared/api`에서 Ky HTTP 오류를 검증하고 Query retry/throw 정책을 분리해 provider에 연결했다.                      | transport/policy/provider 집중 66개 테스트, 전체 119개 테스트와 모든 품질 게이트, handler 400/500 계약을 확인했다.                                                                                                         | `18e47da`, `a2bd150`, `09e519a`, `207b88a`, `927da7e`를 정상 push했다.                                                              |
| Todo 6 | `InlineQueryError`, `useInlineQueryRetry`, root/products `error.tsx`, Query reset 연결을 추가했다.                 | 400 인라인 복구, 500/transport/schema/render boundary, 요청 수, reset, 세 viewport의 12개 화면, focus·contrast·target을 확인했다.                                                                                          | `70fc911`, `7ded164`, `5d715a4`, `c2cfa06`을 정상 push했다.                                                                         |
| Todo 7 | 제품 코드는 바꾸지 않고 최종 RFC 검증 증거만 추가했다.                                                             | 11개 파일의 119개 테스트와 `pnpm test`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm check` 통과. 두 route, 7개 상태, 3개 폭의 최신 PNG 42개와 시각 이중 PASS, 범위 한정 `AA-ready`를 확인했다. | 별도 커밋 없이 Todo 8로 이관했다. 정상 no-op push 뒤 local/upstream/remote가 `c2cfa06`으로 일치했다.                                |

모든 임시 cookie, delay, render throw, request abort, 브라우저·서버 process와 build
residue를 정리했다. `src/app/api/**`, `package.json`, `pnpm-lock.yaml`은
`WEEK06_BASE..c2cfa06`의 diff와 commit history 모두 변경이 없다. 자동화·브라우저·시각
증거는 `.omo/evidence/week06-fsd/todo-1/`부터 `todo-7/`까지 단계별로 남겼다.

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

### Todo 5 오류 분류표

| 오류 class/status                   | `retry(0)` | `retry(1)` | `throwOnError` | Todo 5 이후 처리                                                 |
| ----------------------------------- | ---------- | ---------- | -------------- | ---------------------------------------------------------------- |
| 인식된 `ApiClientError` 4xx         | false      | false      | false          | Query 오류 상태에 남긴다. 화면 표현과 재시도 UI는 Todo 6 소유다. |
| 인식된 `ApiClientError` 5xx         | true       | false      | true           | 한 번 재시도한 뒤 route boundary로 전파할 계약이다.              |
| Ky `NetworkError`                   | true       | false      | true           | 한 번 재시도한 뒤 route boundary로 전파할 계약이다.              |
| Ky `TimeoutError`                   | true       | false      | true           | 한 번 재시도한 뒤 route boundary로 전파할 계약이다.              |
| 성공 2xx 뒤 product `ZodError`      | false      | false      | true           | 예상 밖 응답 schema 오류로 전파한다.                             |
| JSON decoding `SyntaxError`         | false      | false      | true           | 응답 decoding 오류로 전파한다.                                   |
| 그 밖의 programming/unknown `Error` | false      | false      | true           | 분류하지 않고 예상 밖 오류로 전파한다.                           |

이 표는 shared의 기계적인 class/status 판정만 기록한다. 사용자에게 보일 문구,
인라인 retry control, `QueryErrorResetBoundary`, route `error.tsx`는 Todo 6 전까지
추가하지 않는다.

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

최종 소스의 모든 wishlist import와 소비자를 추적한 결과, 삭제 대상은 다음 세
파일이다.

- `src/entities/wishlist/model/WishlistStore.ts`
- `src/entities/wishlist/model/WishlistStore.test.ts`
- `src/features/toggle-wishlist/ui/ToggleWishlistButton.tsx`

삭제 후 남은 조합 파일은 두 개만 수정한다.

- `src/widgets/header/ui/Header.tsx`: wishlist store/selector import,
  `useHydratePersistedStore(useWishlistStore)`, `wishlistCount` 구독, 위시리스트 개수
  `span`을 제거한다. cart hydration, count, UI는 유지한다.
- `src/widgets/product-list/ui/ProductGrid.tsx`: `ToggleWishlistButton` import와 action
  slot의 wishlist 버튼만 제거한다. `AddToCartButton`과 `ProductCard` 조합은 유지한다.

`src/shared/lib/useHydratePersistedStore.ts`는 cart가 계속 사용하므로 삭제하지 않는다.
`src/features/product-filter/**`, `src/entities/product/model/**`,
`src/entities/product/api/**`, `src/shared/api/**`, `src/app/**`, route handler는 wishlist를
import하거나 상태를 소비하지 않아 수정하지 않는다. 기존 브라우저의
`commerce-wishlist` localStorage 값은 기능 제거 뒤 읽히지 않는 비활성 데이터다.
별도 삭제 정책이 필요해질 때만 app migration seam의 후속 작업으로 다룬다.

최종 응집도 판정은 **통과**다. wishlist의 상태와 행동은 각각 한 entity와 한 feature에
모였고, 제거에 필요한 나머지 두 수정 지점도 Header 표시와 ProductGrid 행동 조합이라는
이름 있는 책임에서 바로 예측된다. cart와 wishlist가 Header 집계와 ProductGrid action을
대칭으로 조합하는 구조는 제거 대상의 은닉이 아니라 의도한 조합이다. 이 두 지점의
파편화는 상위 widget이 하위 관심사를 조합하기 위해 받아들인다.

### 신상품 badge 추가

현재 mock만 대상으로 한 prototype과 신뢰 가능한 제품 계약의 변경 반경은 다르다.

#### 현재 mock prototype

현재 `src/app/api/_data/commerce.ts`의 30개 `createdAt` 값은 모두 `Date.parse`가 해석하는
ISO 시각 문자열이다. home/products handler도 같은 값을 정렬에 사용한다. 이 고정된 mock
데이터만 대상으로 badge를 시연한다면
`src/entities/product/ui/ProductCard.tsx` 한 파일에서 표시할 수 있다.

다만 `src/entities/product/model/ResponseSchema.ts`의 현재 계약은
`createdAt: z.string()`뿐이다. 임의 문자열도 schema를 통과하므로 현재 fixture의 형태를
외부 상품 응답의 ISO datetime 보장으로 해석할 수 없다. 따라서 한 파일 범위는 현재
mock을 이용한 prototype에만 유효하다.

#### 신뢰 가능한 제품 계약

신뢰 가능한 범위는 product entity 안의 다음 다섯 파일이다.

- `src/entities/product/model/ResponseSchema.ts`: `createdAt`을 ISO datetime으로
  검증해 잘못된 외부 날짜 문자열을 repository 경계에서 거부한다.
- `src/entities/product/model/ResponseSchema.test.ts`: 유효한 ISO datetime의 통과와
  임의 문자열·잘못된 날짜의 거부를 회귀 테스트로 고정한다.
- `src/entities/product/model/ProductNewness.ts`: 제품 정책으로 확정한 고정 N일과
  주입된 `referenceNow`를 받아 신상품 여부를 반환하는 순수 규칙을 둔다. 이 규칙은
  system clock을 내부에서 읽지 않는다.
- `src/entities/product/model/ProductNewness.test.ts`: 고정한 `referenceNow`로 N일 경계
  직전·경계·직후와 미래 시각을 검증해 실행 시각과 무관한 결과를 보장한다.
- `src/entities/product/ui/ProductCard.tsx`: client mount effect에서 `referenceNow`를 한
  번 상태로 고정하고 순수 규칙에 전달한다. 기준시각이 생기기 전에는 badge를 렌더링하지
  않으며 render마다 `Date.now()`를 호출하지 않는다.

badge를 홈과 상품 목록에 공통 적용하므로 현재 구조에서는 `ProductGrid`, `HomeView`,
`ProductListView`, `ProductRepository`, `ProductService`, API route handler를 바꿀 필요가
없다. schema가 검증한 `Product.createdAt`과 product entity의 순수 판정 규칙을 카드가
소비하면 현재 두 화면에 같은 기준이 적용된다.

현재 상품 데이터는 client Query가 완료된 뒤 렌더된다. mount 전후의 첫 markup에는
badge가 없고 effect 뒤에만 판정하므로 render 시각에 따른 초기 hydration 차이를 만들지
않는다. 나중에 server-rendered initial data에서 첫 HTML부터 badge를 보여주려면 각 카드가
서로 다른 clock을 읽게 두지 않는다. request마다 한 번 고정한 `referenceNow`를 모든 카드에
전달해야 하며, 이때는 `ProductGrid`나 view까지 전달 경로가 확장될 수 있다.

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
RFC 초안에 도움을 주었다. AI 실행 에이전트가 명령과 브라우저 흐름을 실행하고 캡처한
selector, 상태 계약, source ownership, 임시 handler diff, cleanup receipt를
교차 확인했다. 독립 검토 에이전트는 기록과 최종 소스를 다시 대조했다. 최종 사람 검토와
승인은 아직 대기 중이다.

| 검토 항목                                                        | 처리 | 근거                                                                                                     |
| ---------------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------- |
| 과제의 `_pages` 대신 `views` 사용                                | 수용 | 저장소 FSD 규칙이 route 조합에 `views`를 명시한다.                                                       |
| 실제 파일 경로 import 사용                                       | 수용 | 저장소 규칙이 습관적 `index.ts` 배럴을 금지한다.                                                         |
| ProductCard를 entity에 두고 widget에서 action slot 조합          | 수용 | 보이는 control을 유지하면서 entity-to-feature 압력을 제거한다.                                           |
| slice-root public barrel을 추가하라는 일반 FSD 조언              | 반려 | 저장소의 직접 import 결정과 충돌한다.                                                                    |
| `src/app/api/**`를 프런트엔드 파일과 함께 이동                   | 반려 | 명시적으로 마이그레이션 범위 밖이며 임시 seam은 제거했다.                                                |
| test cookie 또는 scenario query key를 영구 추가                  | 반려 | 사용자 URL/상태 계약과 mock 동작을 바꾼다.                                                               |
| products 로딩 증거가 loaded 상태를 보인다는 독립 검토 지적       | 수용 | 실제 pending navigation에서 로딩 텍스트와 loaded count의 상호 배타성을 캡처해 교체했다.                  |
| 두 route boundary 파일이 file map에 없다는 독립 검토 지적        | 수용 | `src/app/error.tsx`, `src/app/products/error.tsx`의 계획된 소유와 근거를 표에 추가했다.                  |
| RFC의 기존 유효하지 않은 scope 표기                              | 수용 | 실제 commitlint 유효 커밋인 `docs(week-06): add FSD RFC and behavior baseline`으로 고쳤다.               |
| Todo 2 standards 검토의 hard violation 없음                      | 수용 | 이동 파일, 실제 import, hydration 호출, LSP와 품질 게이트가 저장소 규칙을 만족한다.                      |
| README/rules의 이전 경로도 Todo 2에서 지우라는 검토 지적         | 반려 | 삭제 대상은 `src/features/cart/**`와 `src/features/wishlist/**`이며 문서 변경은 이 RFC 증거로 제한한다.  |
| Todo 3 기능/design-system 독립 검토의 회귀 없음                  | 수용 | 전체 capture, DOM, action, Header 동기화와 FSD 조합이 기준선과 같다고 판정했다.                          |
| Todo 3 visual/CJK 독립 검토의 회귀 없음                          | 수용 | 네 쌍은 0 pixel diff이고 products desktop 차이는 상품 image raster에만 있다고 판정했다.                  |
| Todo 4에서 import 수정이 필요하다는 가정                         | 반려 | CodeGraph와 전체 import 감사에서 현재 consumer가 이미 실제 파일 경로와 하향 방향을 만족했다.             |
| module identity test를 다른 경로 test로 대체하라는 제안          | 반려 | 실제 entity 동작 test와 localhost route 동기화가 사용자 관찰 계약을 직접 증명한다.                       |
| Todo 4 standards 독립 검토의 위반 없음                           | 수용 | test 삭제와 RFC 변경에서 FSD, lint/format, 접근성, 검증 규칙 위반이나 유의미한 code smell을 찾지 못했다. |
| Todo 4 spec 독립 검토의 누락과 범위 초과 없음                    | 수용 | Todo 4 삭제, 소유권, import, URL/store 증거가 충족되고 Todo 5 source 변경이 없다고 판정했다.             |
| Todo 5 standards 독립 검토의 위반 없음                           | 수용 | transport, policy, provider, test가 저장소 규칙과 FSD 방향을 만족하고 유의미한 code smell이 없다.        |
| Todo 5 spec 검토의 source 누락과 범위 초과 없음                  | 수용 | Todo 5 계약을 충족하고 Todo 6 UI/route boundary 변경이 없다고 판정했다.                                  |
| ignore된 Todo 5 evidence를 Git에서 볼 수 없다는 지적             | 보정 | AI 실행 에이전트가 artifact 7개를 확인하고 독립 검토 영수증에 가시성 한계와 해소 결과를 기록했다.        |
| Todo 6 시각 기능 검토의 blocker 없음                             | 수용 | 12개 전체 화면에서 인라인/route 분리, FilterBar, focus style과 token 사용을 확인했다.                    |
| Todo 6 시각/CJK 검토의 blocker 없음                              | 수용 | mobile 어절 수정 뒤 12개 전체 캡처가 clipping, overflow, 개발 chrome 없이 통과했다.                      |
| Todo 6 WCAG 검토의 `AA-ready`                                    | 수용 | contrast, Tab 왕복, focus 비가림 manual gap을 실제 browser 측정으로 추가 확인했다.                       |
| Todo 6 standards 검토의 중복 retry 지적                          | 수용 | 두 owner의 state machine을 `useInlineQueryRetry` 한곳으로 모았다.                                        |
| Todo 6 standards 검토의 RFC table pipe 지적                      | 수용 | cell의 literal pipe를 제거하고 네 열 table로 다시 작성했다.                                              |
| Todo 6 spec 검토의 native disabled focus 지적                    | 수용 | guarded `aria-disabled`로 중복 실행을 막고 pending focus와 outline 유지까지 browser에서 재검증했다.      |
| Todo 6 spec 검토의 DESIGN 문서 범위 초과 지적                    | 수용 | 새 token이 없는 focused UI이므로 선택적 Query recovery 문단을 제거했다.                                  |
| Todo 7 시각 이중 검토의 42개 화면 회귀 없음                      | 수용 | 최종 source 복원 뒤 만든 42개 PNG를 두 검토가 모두 PASS로 판정했다.                                      |
| Todo 7 WCAG 검토의 범위 한정 `AA-ready`                          | 수용 | keyboard, accessibility tree, reflow, contrast, target 근거가 있는 범위에만 한정했다.                    |
| Todo 7 검토의 명령 순서 누락 지적                                | 반려 | 직접 요구한 명령 순서대로 이미 실행했으며 reviewer가 plan 순서를 우선해 생긴 오판이었다.                 |
| Todo 7 검토의 remote parity 누락 지적                            | 반려 | 갱신된 cleanup receipt에서 local/upstream/remote `c2cfa06` 일치를 확인한 뒤 stale 지적으로 판정했다.     |
| Todo 8 wishlist 삭제 반경과 응집도 판정                          | 수용 | CodeGraph의 최종 import 흐름을 대조해 삭제 3개와 조합 수정 2개로 확정했다.                               |
| Todo 8 badge 한 파일 예측이 schema·clock 계약을 누락했다는 지적  | 수용 | mock prototype과 신뢰 가능한 범위를 분리하고 ISO schema, 순수 규칙·테스트, 고정 기준시각을 추가했다.     |
| Todo 8의 실행·검증 주체 표기가 부정확하다는 지적                 | 수용 | 실행·교차 확인 주체를 AI 에이전트로 바로잡고 최종 사람 검토·승인을 대기 상태로 명시했다.                 |
| F1 목표 트리와 전체 파일 map에서 최종 파일 6개가 누락됐다는 지적 | 수용 | runtime 2개와 test 4개를 목표 트리와 exact map 행에 추가하고 전체 source name-status를 다시 대조했다.    |

사전 두 축 검토에서는 Todo 1 명세 누락을 찾지 못했다. Todo 2 두 축 검토에서도 source
구현과 저장소 규칙 위반은 없었다. README와 rules의 이전 경로 예시까지 바꾸라는 지적은
명시된 source 삭제 범위와 RFC-only 문서 범위를 넘어 반려했다. Todo 3의 두 독립 시각
검토는 전체 최신 capture에서 기능, layout, CJK 회귀를 찾지 못했다. Markdown 형식은
staged Prettier hook으로 확인한다. Todo 4의 standards/spec 두 축 독립 검토도 tracked
diff와 evidence를 확인하고 blocking finding 없이 통과했다. Todo 5 standards/spec 두
축 검토도 source finding 없이 통과했고 ignore된 evidence 가시성 지적은 실제 artifact
확인으로 해소했다. Todo 6의 두 시각 검토와 WCAG 검토는 blocker 없이 통과했다. standards와
spec 검토가 찾은 중복 hook, table, focus, 문서 범위 지적은 모두 반영한 뒤 같은 품질
게이트와 browser 복구를 다시 실행했다.

Todo 7의 접근성 결론은 실제 screen reader 음성을 실행한 결과가 아니다. Chromium
accessibility tree의 role/name/state, 실제 keyboard 흐름, contrast와 reflow를 확인한
범위에서만 `AA-ready`로 기록한다. `.omo/evidence/**`는 로컬의 ignore된 증거이므로 원격
PR에서 직접 열 수 없고, 필요한 화면은 PR에 별도 첨부해야 한다. Todo 8에서는 원격 PR,
원격 CI, reviewer 승인 결과를 만들거나 주장하지 않는다.
