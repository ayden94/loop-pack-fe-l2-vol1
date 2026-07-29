## 📌 이번 PR 요약

<!-- 어떤 주차의, 무엇을 한 PR인지 한눈에 보이게 1~3줄로 작성한다. -->

- 주차: Week 06
- 무엇을 / 왜: Week 05의 커머스 동작과 상태 원본을 유지하면서 FSD 책임을 entity, feature, widget, view로 다시 나누고, 오류 종류에 맞는 인라인 복구와 route 오류 경계를 추가했습니다.
- 관련 이슈: Closes #

### 변경 전후 구조

변경 전에는 상품 표현이 action feature를 직접 알고, cart와 wishlist 상태가 feature에 있었습니다.

```txt
widgets/product-card -> features/cart, features/wishlist
features/cart         -> store + action UI
features/wishlist     -> store + action UI
```

변경 후에는 상품 표현, 상태, 행동, 조합 책임을 나눴습니다.

```txt
app -> views -> widgets/product-list -> features/* -> entities/* -> shared

entities/product/ui/ProductCard.tsx
entities/cart/model/CartStore.ts
entities/wishlist/model/WishlistStore.ts
features/add-to-cart/ui/AddToCartButton.tsx
features/toggle-wishlist/ui/ToggleWishlistButton.tsx
widgets/product-list/ui/ProductGrid.tsx
```

- `ProductCard`는 상품 이미지, 가격, 할인, 의미 구조만 표현하고 optional action slot을 받습니다.
- `ProductGrid`가 cart와 wishlist action을 조합하며 entity는 feature를 import하지 않습니다.
- route page는 view만 렌더링하고, 실제 파일 경로 import와 `views` 레이어를 유지했습니다.
- `src/app/api/**`, API 응답 계약, package와 lockfile은 바꾸지 않았습니다.

### 상태와 오류 설계

- 서버 응답은 TanStack Query, 공유 가능한 filter는 nuqs, 비로그인 cart/wishlist ID 집합은 Zustand, 일시 UI는 React 로컬 상태가 계속 소유합니다.
- Query key와 `staleTime`은 홈 60초, 목록 30초를 유지하며 서버 데이터를 Zustand에 복사하지 않습니다.
- 인식된 4xx는 콘텐츠 영역의 `InlineQueryError`에서 처리하고, retry 중 label, `aria-disabled`, focus를 유지합니다.
- 5xx와 transport/timeout은 한 번 재시도한 뒤 route boundary로 전파합니다.
- schema/JSON/programming 오류는 재시도 없이 route boundary로 전파합니다.
- boundary reset은 Query reset 뒤 Next reset을 호출합니다. root `error.tsx`는 `layout.tsx`와 Header 오류를 잡지 못하고, React Error Boundary는 event handler나 비동기 callback의 나중 오류를 잡지 못합니다.

### 영향 범위

- **UI 변경**: 인라인 오류 복구와 root/products fallback 추가
- **API 변경**: 없음
- **상태 원본 변경**: 없음
- **의존성 변경**: 없음
- **롤백**: Week 06 커밋 단위로 가능

### 검증

- [x] `pnpm test`: 11개 파일, 119개 테스트 통과
- [x] `pnpm format:check`: 통과
- [x] `pnpm lint`: 통과
- [x] `pnpm typecheck`: 통과
- [x] `pnpm build`: 통과
- [x] `pnpm check`: 119개 테스트, lint, typecheck, production build 재통과
- [x] 홈/상품 normal, loading, empty, filter, pagination, 공유 URL, refresh, Back/Forward 확인
- [x] cart/wishlist route 동기화, version 1 persist, malformed 저장값 복구 확인
- [x] 4xx 인라인 retry, 5xx/transport/schema/render boundary와 reset 확인
- [x] Tab/Shift+Tab, Enter/Space, focus, accessible name/state, 반응형 확인
- [x] 최종 source에서 두 route, 7개 상태, 3개 폭의 PNG 42개 재캡처와 독립 시각 검토 2회 PASS
- [x] 확인한 화면 범위에서 WCAG 2.2 AA-ready 판정
- [ ] 실제 screen reader 음성 확인: 실행하지 않음
- [ ] 원격 CI 확인: PR을 생성하지 않아 실행 결과 없음

### 수동 확인 방법

1. `/`와 `/products`에서 정상, 로딩, 빈 결과를 확인합니다.
2. 상품 filter와 pagination을 변경한 뒤 URL 공유, 새로고침, Back/Forward 복원을 확인합니다.
3. 홈에서 cart와 wishlist를 변경하고 상품 route와 새로고침 뒤 Header와 `aria-pressed`를 확인합니다.
4. 4xx에서는 FilterBar 유지와 인라인 retry를, 5xx·transport·schema 오류에서는 route fallback과 reset을 확인합니다.
5. mobile, tablet, desktop에서 keyboard focus, 가로 overflow, 한국어 줄바꿈을 확인합니다.

### 스크린샷과 증거

- 자동화와 브라우저 기록: `docs/rfc/week06-fsd.md`
- 로컬 상세 증거: `.omo/evidence/week06-fsd/todo-1/`부터 `todo-7/`까지
- PR 첨부 화면: 필요 시 42개 최종 캡처 중 대표 화면 첨부

### 최종 확인

- [x] RFC를 첫 Week 06 소스 이동 전에 별도 커밋
- [x] 상향 import, 같은 레이어 교차 slice import, 새 barrel 없음
- [x] 임시 cookie, delay, render throw, request abort와 build residue 정리
- [x] `src/app/api/**`, `package.json`, `pnpm-lock.yaml`의 Week 06 commit history 변경 없음
- [x] AI 지원 범위와 수용·반려한 검토 의견 기록
- [x] Advanced 작업 없음

## 📚 이번 주 학습

<!-- 이 과제를 통해 무엇을 학습했는지 정리한다. 학습 주제와, 새로 배우거나 적용해 본 것. -->

- 학습 주제: FSD 책임 분리, 상태 Source of Truth 보존, TanStack Query 오류 복구 경계
- 배운 것 / 새로 적용한 것:
  - entity 표현이 action feature를 직접 알지 않도록 widget의 slot 조합으로 의존 방향을 지켰습니다.
  - cart/wishlist의 영속 상태와 사용자 행동 UI를 분리해 상태 계약은 entity에, 행동은 feature에 뒀습니다.
  - Ky는 HTTP 오류 정규화만 맡고, Query가 오류 class에 따라 retry와 boundary 전파를 결정하도록 소유권을 나눴습니다.
  - 실제 URL, localStorage, 요청 수, focus, accessibility tree, 시각 캡처를 함께 확인해야 구조 이동 뒤 동작 보존을 설명할 수 있었습니다.

### AI 활용과 검토

- AI 지원 영역: 코드베이스 inventory, FSD 파일 배치 후보, 오류 정책 검토, 브라우저 검증 절차, RFC와 PR 초안
- AI 실행 및 교차 확인: 실행 에이전트와 독립 검토 에이전트가 import, 경로, 테스트·빌드 결과, 브라우저 evidence, cleanup, Git parity를 최종 소스와 대조했습니다.
- 수용한 의견: `views` 사용, 실제 파일 경로 import, entity `ProductCard`와 widget action 조합, route boundary 파일 매핑, 공통 retry hook, `aria-disabled` focus 유지, 범위 한정 AA-ready 판정
- 반려한 의견: 저장소 규칙과 충돌하는 slice-root barrel, 범위 밖 `src/app/api/**` 이동, 영구 test cookie/query key, 약한 module identity 대체 테스트, 직접 요구와 다른 명령 순서 지적, 갱신 전 증거를 읽은 parity 지적
- 최종 사람 검토: 아직 수행하지 않았으며 승인도 대기 중입니다.
- 한계: 실제 screen reader 음성과 원격 CI 결과는 확인하지 않았습니다.

## 🤔 고민한 점 / 막혔던 부분

<!-- 어떤 선택을 두고 고민했는지, 어려웠던 것, 아직 해결하지 못한 것을 자유롭게 적는다. -->

- wishlist 제거는 entity model/test와 toggle feature를 삭제하고 Header와 ProductGrid 조합만 수정하면 됩니다. shared, product-filter, product API, route 변경이 없어 최종 응집도는 충분하다고 판단했습니다.
- Header 집계와 ProductGrid action에 cart/wishlist가 함께 나타나는 파편화는 상위 widget의 조합 책임이며, 두 기능의 대칭을 유지하기 위해 받아들였습니다.
- 신상품 badge 변경 반경:
  - 현재 30개 mock fixture는 ISO 시각이므로 prototype은 `ProductCard.tsx` 한 파일에서 표시할 수 있습니다.
  - 신뢰 가능한 기능은 `ResponseSchema.ts`와 `ResponseSchema.test.ts`에서 ISO datetime 계약을 보장해야 합니다.
  - `ProductNewness.ts`와 `ProductNewness.test.ts`는 고정 N일과 주입된 `referenceNow`를 사용하는 순수 규칙과 경계값을 검증합니다. `ProductCard.tsx`는 client mount effect에서 기준시각을 한 번 고정하고, 그전에는 badge를 숨겨 초기 hydration 차이를 만들지 않으며 render마다 clock을 다시 읽지 않습니다.
  - badge를 홈과 상품 목록에 공통 적용하므로 현재는 API handler, repository/service, widget, view 변경이 필요하지 않습니다.
  - 나중에 server-rendered initial data를 도입하면 request 단위 기준시각을 상위 조합에서 전달해야 하므로 변경 반경이 넓어질 수 있습니다.
- root `error.tsx`가 layout/Header 오류를 잡지 못하는 점과 실제 screen reader 음성을 검증하지 않은 점은 남은 한계입니다.
- 375 px의 긴 상품명과 가격 단위 줄바꿈은 기존 기준선과 같고 overflow나 clipping이 늘지 않아 이번 구조 리팩터링에서 수정하지 않았습니다.

## 🙋 피드백 받고 싶은 부분

<!-- 리뷰어가 어디를 집중해서 봐주면 좋을지 콕 집어 적는다. 피드백이 이 과제의 핵심이다. -->

- `ProductCard`의 작은 인터페이스와 `ProductGrid`의 action 조합이 entity/feature/widget 책임을 충분히 분리했는지 확인해주세요.
- cart/wishlist 상태를 entity model에 두고 action UI만 feature로 둔 기준이 적절한지 확인해주세요.
- 4xx 인라인 복구와 5xx/transport/schema route boundary 분류, Query reset 뒤 Next reset 순서가 자연스러운지 확인해주세요.
- wishlist 삭제 반경과 신상품 badge의 `ResponseSchema`, `ProductNewness` 규칙·테스트, `ProductCard` 표현 범위가 충분한지 확인해주세요.
- 실제 screen reader 음성 없이 accessibility tree와 keyboard 근거로 범위를 한정한 `AA-ready` 표현이 과장되지 않았는지 확인해주세요.
