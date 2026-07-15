# Loopers Pack — Frontend L2 Vol.1

Loopers 프론트엔드 과정(TypeScript · React · Next.js)의 과제 제출 & 피드백 레포입니다.
4주차부터 이 레포가 **커머스 프로젝트(Next.js)** 본체가 됩니다.

## 시작하기

필수 도구는 Node.js 24.17.0과 pnpm 10.15.1입니다. `.nvmrc`는 현재 권장 LTS를 고정하고, `package.json`의 Node.js 범위(`>=22.12.0`)는 지원 가능한 Node.js 22 이상을 허용합니다.

```bash
nvm use
pnpm install
pnpm dev
```

`pnpm test`는 전체 Vitest 테스트가 통과해야 완료됩니다. `pnpm check`는 테스트, lint, 타입 검사, 프로덕션 빌드를 순서대로 실행하며 네 단계가 모두 통과해야 완료됩니다. GitHub Actions도 pull request와 `main` push에서 같은 `pnpm check`를 실행합니다.

> Next.js(App Router) + React 19 + TypeScript. 1~3주차 React+Vite 산출물은 개인 브랜치 히스토리에 남아 있습니다.

## 구조

```txt
src/
  app/                           # Next App Router entry
    _components/
      dialog-demos/              # Dialog demo components and tokenized styles
      DialogDemos.client.tsx
      select-demos/              # Select demo options, renderers, styles
      SelectDemos.client.tsx
    favicon.ico
    globals.css
    layout.tsx
    page.tsx
  shared/
    ui/
      select/                    # Select (Headless) — 4주차 1단계
        components/
        lib/
        types/
      dialog/                    # Dialog (Compound) — 4주차 2단계
docs/assignments/                # 주차별 과제 명세
```

> Next entry와 Select/Dialog 예시는 `src/app`에, 재사용 가능한 UI 구현은 `src/shared/ui`에 둡니다.

## 주차별 과제

- [1주차 — 코드 리뷰 & AI 협업 환경 구축](docs/assignments/week-01.md)
- [3주차 — 관심사 분리 & Custom Hook](docs/assignments/week-03.md)
- [4주차 — Next.js 커머스 프로젝트 골격](docs/assignments/week-04.md)
- 새 과제가 올라오면 **본인 포크의 `main`을 이 레포(upstream)와 동기화**해 받으세요.
  - GitHub: 포크 레포의 **Sync fork** 버튼
  - CLI: `git fetch upstream && git switch main && git merge upstream/main`

## 코드 품질 하네스

이 프로젝트는 AI가 생성한 코드도 동일한 기준으로 검증하기 위해 ESLint,
Prettier, Husky, lint-staged를 사용합니다.

### ESLint

ESLint는 포맷보다 코드 품질과 버그 가능성 검출에 집중합니다.

주요 설정은 다음과 같습니다.

- Next.js flat config(`core-web-vitals`, `typescript`)를 기본 baseline으로 사용합니다.
- TypeScript strict type-aware rules로 타입 회피와 불명확한 코드를 줄입니다.
- React Hooks / React Compiler lint rules로 Hook 호출 순서, dependency 누락, 렌더 중 state 변경, effect 내 동기 state 변경을 감지합니다.
- React JSX rules로 JSX 보안 및 React 작성 관습을 점검합니다.
- jsx-a11y로 접근성 문제를 정적으로 점검합니다.
- unused-imports / simple-import-sort로 사용하지 않는 import를 제거하고 import 순서를 일관되게 유지합니다.
- Next 라우트 파일(`src/app/**/{page,layout,loading,error,not-found}.tsx`)은 프레임워크 계약상 default export를 허용합니다.

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
- `pnpm typecheck`: Next 단일 TypeScript 프로젝트 타입 검사
- `pnpm build`: Next production 빌드

## 제출

1. 이 레포를 **포크**한다.
2. 포크에서 주차 작업 브랜치를 만든다 (예: `feat/week-04`).
3. 과제를 진행하고 커밋·푸시한다 (본인 포크에).
4. **메인 레포로 PR**을 연다. PR 템플릿(이번 주 학습 / 피드백 받고 싶은 부분)을 채운다.
5. 모든 PR이 한곳에 모이므로 서로 리뷰하고, 코치 피드백 + 다음 세션 구두 방어로 이어진다.

> PR은 **메인 레포(upstream)로** 올립니다 — 모두의 PR이 한곳에 모여 서로 리뷰할 수 있습니다. (협력자 추가는 필요 없습니다.)

## 5주차 과제 기록 — 상태관리 아키텍처

> 홈과 상품 목록을 만들며 서버·URL·클라이언트 상태의 경계를 직접 정의합니다.

### 상태 분류 표

| 상태                                                     | 소유자                                         | 수명                                      | 공유 범위                            | 선택 이유                                                                                                 |
| -------------------------------------------------------- | ---------------------------------------------- | ----------------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| 홈 데이터(banner·categories·popularProducts·newProducts) | TanStack Query(서버 상태)                      | staleTime 동안 캐시, 이후 재조회          | 홈 화면                              | 원본은 서버. 내가 소유하지 않는 스냅샷이므로 Query 캐시에 맡기고 staleTime으로 신선도를 관리한다          |
| 상품 목록(products·totalCount·page·pageSize)             | TanStack Query(서버 상태)                      | query key별로 캐시, staleTime 이후 재조회 | 목록 화면                            | 검색·카테고리·정렬·페이지 조건이 query key에 반영되어 조건별 캐시를 재사용한다                            |
| 카테고리 목록                                            | TanStack Query(서버 상태, 홈·목록 쿼리에 포함) | 홈·목록 쿼리 캐시 안에서 함께 보관        | 홈·목록                              | 별도 쿼리로 분리하지 않고 응답에 포함된 값을 사용한다. 독립 쿼리로 두면 홈·목록이 각각 중복 조회하게 된다 |
| 검색어(q)                                                | nuqs(URL 상태)                                 | URL 수명                                  | 공유·새로고침·앞뒤 이동 복원         | 검색 조건의 원본은 URL. 공유·새로고침·뒤로 가기로 같은 결과가 복원되어야 한다                             |
| 카테고리(category)                                       | nuqs(URL 상태)                                 | URL 수명                                  | 공유·새로고침·앞뒤 이동 복원         | 홈의 카테고리 링크로 진입하거나 공유 링크로 복원되어야 한다                                               |
| 정렬(sort)                                               | nuqs(URL 상태)                                 | URL 수명                                  | 공유·새로고침·앞뒤 이동 복원         | 정렬 조건도 공유·복원 대상. 기본값 `latest`를 URL에 명시해 API 요청과 항상 일치시킨다                     |
| 페이지(page)                                             | nuqs(URL 상태)                                 | URL 수명                                  | 공유·새로고침·앞뒤 이동 복원         | 페이지 위치도 복원 대상. 검색·카테고리·정렬이 바뀌면 1로 돌아간다                                         |
| 비로그인 장바구니(cart)                                  | Zustand(전역 클라이언트 상태)                  | 세션 수명, 새로고침 시 초기화             | 홈·목록(헤더 카운트, 상품 담기 버튼) | 여러 페이지에서 함께 쓰는 비로그인 사용자의 로컬 상태. 서버 원본이 없는 동안 Zustand가 임시 소유자다      |
| 비로그인 위시리스트(wishlist)                            | Zustand(전역 클라이언트 상태)                  | 세션 수명, 새로고침 시 초기화             | 홈·목록(헤더 카운트, 상품 찜 버튼)   | 장바구니와 동일한 근거. 서버 동기화가 생기면 소유권이 서버로 이동한다                                     |
| 모달·드롭다운 열림 여부                                  | React 로컬 상태                                | 컴포넌트 수명                             | 해당 컴포넌트                        | 한 화면에서만 쓰는 일시적 UI 상태. 공유·복원 필요가 없으므로 전역에 두지 않는다                           |
| 제출 전 입력 초안(검색 input 값 등)                      | React 로컬 상태 또는 nuqs                      | 컴포넌트 수명 또는 URL 수명               | 해당 화면                            | URL 상태와 동기화해야 하는 값은 nuqs로, 일시적 초안은 React 로컬 상태로 둔다                              |

### 책임 분담 기준

- **TanStack Query** — 서버에서 온 데이터의 조회 상태와 캐시 수명. 서버 응답을 Zustand에 복사하지 않는다. `queryOptions`로 query key·queryFn·staleTime을 한곳에 모아 재사용한다.
- **nuqs** — 검색·카테고리·정렬·페이지처럼 공유·새로고침·앞뒤 이동으로 복원해야 하는 조건. `NuqsAdapter`로 App Router를 감싸고 `useQueryStates`와 parser로 관리한다. `history: "push"`로 각 변경을 앞뒤 이동에서 복원한다.
- **Zustand** — 여러 페이지에서 함께 쓰는 비로그인 장바구니·위시리스트. 컴포넌트는 필요한 값과 action만 selector로 선택해 구독한다. 헤더 개수는 별도 저장하지 않고 파생한다.
- **React 로컬 상태** — 모달 열림 여부·입력 초안처럼 한 화면·컴포넌트 수명에 머무는 일시적 UI 상태. 전역에 올리지 않는다.

### 캐시 정책(staleTime · gcTime)

- **홈 쿼리** — `staleTime: 60_000`(1분). 홈은 여러 섹션을 묶어 한 번에 가져오고 갱신 주기가 짧지 않아 1분 정도 신선도를 유지한다. `gcTime`은 기본값(5분)으로 두어 컴포넌트 언마운트 후 재방문 시 캐시를 재사용한다.
- **목록 쿼리** — `staleTime: 30_000`(30초). 검색·카테고리·정렬·페이지 조건이 query key에 들어가 조건별 캐시가 만들어진다. 30초면 사용자가 같은 조건으로 돌아올 때 최신 결과를 다시 보여주면서도 짧은 시간 내 재방문은 캐시로 처리한다. `gcTime`은 기본값으로 두어 앞뒤 이동 중 캐시가 유지되도록 한다.
- **scenario** — mock API 검증 전용 제어값. 사용자가 관리하는 URL 상태나 `ProductListQuery`에 포함하지 않는다. 서버에서 `MockApiScenario`로 구분한다.

### 전역으로 올리지 않은 상태

- **모달·드롭다운 열림 여부** — 한 화면에서만 쓰는 일시적 UI 상태는 React 로컬 상태로 둔다. 전역 store에 넣으면 불필요한 리렌더와 store 복잡도만 증가한다.
- **검색 입력 초안** — URL 상태와 동기화해야 하는 최종 검색어는 nuqs로 두되, 타이핑 중인 초안은 컴포넌트 로컬 상태로 다루어 매 입력마다 URL이 바뀌지 않게 한다(필요 시 debounce 적용).
- **계산 가능한 값** — 헤더의 장바구니/위시리스트 개수, 할인 여부, 품절 여부 등은 별도 상태로 중복 저장하지 않고 파생한다.

### Zustand store 데이터 형태와 selector 경계

- **데이터 형태** — `cart: Record<productId, true>`, `wishlist: Record<productId, true>`로 productId 집합만 저장한다. 상품 상세 정보는 TanStack Query 캐시에서 가져오고 store에 복사하지 않는다.
- **selector 경계** — Header는 `cartCount`, `wishlistCount` 파생값만 구독한다. 상품 버튼은 `useIsInCart(productId)`, `useIsInWishlist(productId)`로 해당 상품 포함 여부만 구독하고 action(`addToCart`, `removeFromCart`, `toggleWishlist`)은 별도 selector로 가져온다.

### 로그인·서버 동기화가 생기면

위시리스트 소유권이 서버로 이동한다. 이때 로컬 익명 위시리스트를 계정 데이터에 합칠지, 버릴지, 충돌을 어떻게 처리할지 정한 뒤 Zustand의 역할을 서버 상태의 임시 입력 또는 UI 상태로 다시 제한한다. 장바구니도 같은 기준으로 서버 동기화 시점을 설계한다.

### 검증 결과

- **URL 공유**: `?category=fashion&q=stan&page=2` 링크를 새 탭에서 열면 같은 검색·카테고리·정렬·페이지 조건이 복원되고 동일한 상품 목록이 표시된다. ✅
- **새로고침**: 현재 URL의 검색·카테고리·정렬·페이지가 모두 유지된다. nuqs가 URL에서 상태를 재수신(hydrate)한다. ✅
- **앞뒤 이동**: `?q=sta` → `?q=stanley` 순으로 변경한 뒤 뒤로 가면 `?q=sta`로 URL과 input 값이 모두 복원된다(Playwright로 확인). ✅
- **검색 debounce**: 3글자를 100ms 안에 빠르게 입력하면 입력 직후엔 URL이 바뀌지 않고, 멈춘 뒤 300ms 후 `?q=sta`로 한 번만 갱신된다. 매 키스트로크마다 URL이 바뀌지 않는다(Playwright로 확인). ✅
- **페이지네이션**: totalCount=30, pageSize=12일 때 `1 / 3`에서 다음 버튼 활성, `2 / 3`에서 양쪽 활성, `3 / 3`에서 다음 비활성. URL `?page=N`이 동기화된다(Playwright로 확인). ✅
- **store 일관성**: 홈에서 담은 상품이 목록의 헤더 카운트와 상품 버튼 상태에 즉시 반영된다. Zustand store가 단일 인스턴스이므로 두 화면이 같은 상태를 공유한다. ✅
- **클라이언트 페이지 이동**: 홈→목록→홈 이동 중 장바구니·위시리스트 상태와 헤더 개수가 유지된다. Header를 root layout으로 옮겨 라우트 전환에도 카운트가 초기화되지 않는다. ✅

### AI 활용

- 상태 분류와 캐시 정책 설계, FSD 레이어 배치에 AI 도움을 받았습니다.
- 최종 설계는 과제 명세의 checklist와 `docs/rules/fsd-architecture.md`를 기준으로 직접 검토했습니다.
