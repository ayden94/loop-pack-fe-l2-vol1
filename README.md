# Loopers Pack — Frontend L2 Vol.1

Loopers 프론트엔드 과정(TypeScript · React · Next.js)의 과제 제출 & 피드백 레포입니다.

## 시작하기

```bash
pnpm install
pnpm dev
```

> React 19 + Vite + TypeScript 기반입니다. (1~3주차 React, 4주차부터 Next.js로 전환 예정)

## 주차별 과제

- [1주차 — 코드 리뷰 & AI 협업 환경 구축](docs/assignments/week-01.md)
- [3주차 — 관심사 분리 & Custom Hook](docs/assignments/week-03.md)

## 코드 품질 하네스

이 프로젝트는 AI가 생성한 코드도 동일한 기준으로 검증하기 위해 ESLint,
Prettier, Husky, lint-staged를 사용합니다.

### ESLint

ESLint는 포맷보다 코드 품질과 버그 가능성 검출에 집중합니다.

주요 설정은 다음과 같습니다.

- TypeScript strict type-aware rules로 타입 회피와 불명확한 코드를 줄입니다.
- React Hooks / React Compiler rules로 Hook 호출 순서, dependency 누락, 렌더 중 state 변경, effect 내 동기 state 변경을 감지합니다.
- React JSX rules로 JSX 보안 및 React 작성 관습을 점검합니다.
- jsx-a11y로 접근성 문제를 정적으로 점검합니다.
- unused-imports / simple-import-sort로 사용하지 않는 import를 제거하고 import 순서를 일관되게 유지합니다.

### Prettier

Prettier는 코드 포맷팅만 담당합니다. ESLint와 포맷 책임이 겹치지 않도록
`eslint-config-prettier`를 사용합니다.

### Git Hook

커밋 전 `lint-staged`를 실행합니다.

- 변경된 TS/TSX 파일: ESLint 자동 수정 후 Prettier 적용
- 변경된 JS/JSON/CSS/MD 파일: Prettier 적용

검사를 통과하지 못하면 커밋되지 않습니다.

### Scripts

```bash
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
pnpm typecheck
pnpm build
```

- `pnpm lint`: 전체 소스 ESLint 검사
- `pnpm lint:fix`: 자동 수정 가능한 ESLint 문제 수정
- `pnpm format`: Prettier로 포맷 적용
- `pnpm format:check`: 포맷 위반 여부 확인
- `pnpm typecheck`: TypeScript 타입 검사
- `pnpm build`: 타입 검사 후 Vite 빌드

## 새 주차 과제 받기

각 주차 과제는 이 메인 레포에 업데이트됩니다. 새 과제가 올라오면 **본인 포크의 `main`을 이 레포(upstream)와 동기화**해 받으세요.

- 간단히: 포크한 GitHub 레포 페이지의 **Sync fork** 버튼.
- CLI: `git remote add upstream https://github.com/loopers-labs/loop-pack-fe-l2-vol1.git` 등록 후 `git fetch upstream && git switch main && git merge upstream/main`.

## 제출

1. 이 레포를 **포크**한다.
2. 포크에서 작업 브랜치를 만든다 (예: `feat/week-01`).
3. 과제를 진행하고 커밋·푸시한다 (본인 포크에).
4. **메인 레포로 PR**을 연다 (base: 메인 레포의 `main` ← compare: 본인 포크의 작업 브랜치). PR 템플릿(이번 주 학습 / 피드백 받고 싶은 부분)을 채운다.
5. 모든 PR이 메인 레포 한곳에 모이므로 **서로의 PR을 리뷰**하고, 코치 피드백 + 다음 세션 구두 방어로 이어진다.

> PR은 **메인 레포(upstream)로** 올립니다 — 모두의 PR이 한곳에 모여 서로 리뷰할 수 있습니다. (협력자 추가는 필요 없습니다.)

## 3주차 과제 기록

`src/productList/ProductListPage.tsx`에 모여 있던 화면, 상태, API, 포맷팅 책임을 FSD 레이어 기준으로 분리했습니다. 최종 페이지 컴포넌트는 화면 블록과 hook을 조립하고, 필터/검색/페이지네이션 상태와 상품 요청 흐름은 custom hook과 service로 이동했습니다.

### 관심사 분류

| 위치                                            | 관심사                  | 분리 후보                                               | 분리하지 않은 근거                                                       |
| ----------------------------------------------- | ----------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------ |
| `src/pages/product-list/ui/ProductListPage.tsx` | 페이지 조립             | widgets, features, hooks 조합                           | 화면 블록과 handler 연결만 남아 있어 page 조립 역할로 충분하다.          |
| `src/widgets/product-list`                      | 화면 블록               | header, filter panel, toolbar, grid                     | 여러 feature/entity UI를 묶는 상품 목록 단위라 widget으로 유지했다.      |
| `src/features/product-list/model/hooks`         | 필터/요청/상호작용 상태 | search params, product request, wishlist/recentlyViewed | 사용자 행동과 상태 전이를 한 곳에서 읽기 위해 feature hook으로 분리했다. |
| `src/entities/product`                          | 상품 도메인             | API service/repository, ProductCard                     | 상품 응답 파싱과 상품 카드 표시 규칙은 product entity에 가깝다.          |
| `src/shared/ui/form/DebouncedInput.tsx`         | debounce 입력           | 검색어/가격 입력 공통화                                 | 상품 도메인에 묶이지 않는 입력 동작이라 shared에 두었다.                 |

### Custom Hook 근거

| Hook                         | 한 문장 설명                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------ |
| `useProductListSearchParams` | URL search params를 상품 목록 필터 상태로 변환하고 변경 handler를 제공한다.    |
| `useProductList`             | 상품 목록 서버 요청 상태와 retry 동작을 관리한다.                              |
| `useProductInteraction`      | wishlist와 최근 본 상품처럼 localStorage 기반 사용자 상호작용 상태를 관리한다. |
| `useAsync`                   | 비동기 요청의 loading/error/success 상태와 refetch 흐름을 공통화한다.          |

### 분리하지 않은 것

- `ProductListPage`는 조립 책임만 남아 있어 별도 hook이나 component로 더 분리하지 않았다.
- `ProductListFilterPanel`과 `ProductListToolbar`는 각각 하나의 화면 블록으로 읽혀 내부 feature UI를 다시 widget으로 나누지 않았다.
- `ProductCard`의 badge, price, title 계산은 상품 카드 표시 규칙이라 product entity UI 내부에 유지했다.

### 숨은 버그 수정 기록

| 증상                                                | 재현 방법                                                            | 원인                                                                                            | 수정한 곳                                                               | 확인                                                                                                   |
| --------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 필터, 검색, 페이지 조건이 새로고침 후 유지되지 않음 | 검색어, 카테고리, 정렬, 페이지를 바꾼 뒤 새로고침한다.               | 화면 조건이 URL이 아니라 컴포넌트 상태에만 있으면 공유/북마크 시 복원할 수 없다.                | `useProductListSearchParams`                                            | URL query로 조건이 복원되는 것을 확인했다.                                                             |
| API 오류 후 새로고침해야 다시 시도할 수 있음        | 상품 요청 실패 상황에서 `다시 시도`를 누른다.                        | 오류 상태와 재요청 동작이 분리되어 있지 않으면 사용자가 page reload에 의존하게 된다.            | `useProductList`, `ProductGrid`                                         | `다시 시도` 버튼으로 refetch되는 것을 확인했다.                                                        |
| 검색/가격 입력 중 API 요청이 너무 자주 발생함       | 검색어나 가격을 빠르게 입력한다.                                     | 입력 변경마다 URL과 API 요청이 즉시 발생했다.                                                   | `DebouncedInput`                                                        | debounce 이후 URL과 요청이 갱신되는 것을 확인했다.                                                     |
| debounce 이후 입력 포커스가 사라짐                  | 검색어를 입력하고 debounce 시간이 지난 뒤 active element를 확인한다. | `key`에 `value`가 포함되어 value 변경마다 input이 remount되었다.                                | `DebouncedInput`                                                        | debounce 이후에도 포커스가 검색 input에 남는 것을 확인했다.                                            |
| 재고 필터 적용 시 페이지네이션 수가 어긋남          | `재고 있는 것만`을 켜고 페이지를 이동한다.                           | 재고 필터를 이미 페이지네이션된 응답에 클라이언트에서 적용해 `totalCount`와 화면 기준이 달랐다. | `useProductListSearchParams`, `app/mock/product-list`, `useProductList` | API query에 `inStock=true`를 포함하고 mock API가 페이지네이션 전에 재고 필터를 적용하는 것을 확인했다. |

### 남은 이슈

- 현재 별도로 남겨둔 버그는 없다.

### 검증

- `pnpm format:check`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- 브라우저에서 URL 조건 유지, retry, debounce 포커스, `inStock=true` 페이지네이션 count를 확인했다.

### AI 활용

- 상품 목록 리팩토링 구조와 일부 코드 초안은 AI 도움을 받아 작성했고, 최종 코드는 직접 검토하며 FSD 경계, hook 책임, retry, debounce 포커스, 재고 필터 페이지네이션 동작을 수정했다.
